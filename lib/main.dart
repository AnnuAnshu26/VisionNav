import 'dart:html' as html;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:url_launcher/url_launcher.dart';

import 'platform_view_registry_stub.dart'
    if (dart.library.html) 'platform_view_registry_web.dart';

import 'screens/navigation_screen.dart';
import 'screens/object_detection_screen.dart';
import 'screens/sos_screen.dart';
import 'screens/report_screen.dart';
import 'screens/combined_screen.dart';

void main() {
  if (kIsWeb) {
    getPlatformViewRegistry().registerViewFactory('tfjs-wrapper', (int viewId) {
      final wrapper = html.DivElement()
        ..id = 'tfjs-wrapper'
        ..style.width = '640px'
        ..style.height = '480px';
      return wrapper;
    });
  }

  runApp(VisionNav());
}

class VisionNav extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Voice Guide',
      theme: ThemeData.dark(),
      home: VoiceCommandHomePage(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class VoiceCommandHomePage extends StatefulWidget {
  @override
  _VoiceCommandHomePageState createState() => _VoiceCommandHomePageState();
}

class _VoiceCommandHomePageState extends State<VoiceCommandHomePage> {
  late stt.SpeechToText _speech;
  final FlutterTts _flutterTts = FlutterTts();
  bool _isListening = false;
  bool _hasHandledCommand = false;
  bool _canListen = true;
  bool isIntroPlaying = false;
  String _lastCommand = "";

  @override
  void initState() {
    super.initState();
    _speech = stt.SpeechToText();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _playWelcomeAndStartListening();
    });
  }

  Future<void> _playWelcomeAndStartListening() async {
    if (isIntroPlaying || _isListening) return;

    isIntroPlaying = true;

    await _flutterTts.setLanguage("en-US");
    await _flutterTts.setSpeechRate(0.5);
    await _flutterTts.setPitch(1.0);
    await _flutterTts.setVolume(1.0);
    await _flutterTts.awaitSpeakCompletion(true);

    await _flutterTts.speak(
      "Welcome to Vision Navigation app. You can say: Navigate to India Gate, Detect obstacles, Send SOS, or Report a hazard.",
    );

    await Future.delayed(Duration(milliseconds: 300));

    if (_canListen) _startListening();

    isIntroPlaying = false;
  }

  void _startListening() async {
    if (_canListen && !_isListening) {
      bool available = await _speech.initialize();
      if (available) {
        setState(() {
          _isListening = true;
          _hasHandledCommand = false;
        });

        _speech.listen(
          onResult: (val) async {
            String recognized = val.recognizedWords.toLowerCase();
            setState(() {
              _lastCommand = recognized;
            });

            if (val.finalResult &&
                recognized.isNotEmpty &&
                !_hasHandledCommand) {
              _hasHandledCommand = true;
              await _speech.stop();
              setState(() => _isListening = false);
              await _handleCommand(recognized);
              if (_canListen) _startListening(); // auto-restart mic
            }
          },
          listenMode: stt.ListenMode.dictation,
          partialResults: true,
          pauseFor: Duration(seconds: 3),
        );
      }
    }
  }

  Future<void> _handleCommand(String command) async {
    command = command.toLowerCase().trim();

    if (command.contains("navigate")) {
      String location = command.split("navigate to").length > 1
          ? command.split("navigate to")[1].trim()
          : command.replaceAll("navigate", "").trim();

      if (location.isEmpty) {
        await _flutterTts.speak("Please specify a location.");
        return;
      }

      await _flutterTts.speak(
        "Starting navigation and object detection to $location",
      );

      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => CombinedScreen(destination: location),
        ),
      );
    } else if (command.contains("detect")) {
      await _flutterTts.speak("Opening object detection");
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => ObjectDetectionScreen()),
      );
    } else if (command.contains("sos") ||
        command.contains("emergency") ||
        command.contains("help")) {
      await _flutterTts.speak("Sending SOS alert");
      Navigator.push(context, MaterialPageRoute(builder: (_) => SosScreen()));
    } else if (command.contains("report")) {
      await _flutterTts.speak("Opening report feature");
      Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => ReportScreen()),
      );
    } else if (command.contains("stop listening")) {
      await _flutterTts.speak("Listening stopped. Tap anywhere to resume.");
      await _speech.stop();
      setState(() {
        _canListen = false;
        _isListening = false;
      });
    } else {
      await _flutterTts.speak("Sorry, I didn’t understand the command.");
    }

    await Future.delayed(Duration(seconds: 1));
    setState(() {
      _hasHandledCommand = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () async {
        if (!_isListening && !isIntroPlaying) {
          setState(() => _canListen = true);
          await _playWelcomeAndStartListening();
        }
      },
      child: Scaffold(
        appBar: AppBar(title: Text('Voice Guide')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('Say a command like:', textAlign: TextAlign.center),
                SizedBox(height: 10),
                Text(
                  '"Navigate to India Gate", "Detect obstacles", "Send SOS", "Report hazard"',
                  style: TextStyle(fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: 20),
                Text(
                  'Heard: $_lastCommand',
                  style: TextStyle(color: Colors.greenAccent),
                ),
                SizedBox(height: 30),
                Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: _isListening ? Colors.redAccent : Colors.blueAccent,
                    boxShadow: _isListening
                        ? [
                            BoxShadow(
                              color: Colors.redAccent.withOpacity(0.6),
                              blurRadius: 30,
                              spreadRadius: 5,
                            ),
                          ]
                        : [],
                  ),
                  child: IconButton(
                    iconSize: 60,
                    icon: Icon(
                      _isListening ? Icons.mic : Icons.mic_off,
                      color: Colors.white,
                    ),
                    onPressed: () {},
                    tooltip: 'Mic status',
                  ),
                ),
                SizedBox(height: 10),
                Text(
                  _isListening
                      ? 'Listening...'
                      : _canListen
                      ? 'Paused'
                      : 'Mic Off',
                  style: TextStyle(fontSize: 16, color: Colors.grey[300]),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

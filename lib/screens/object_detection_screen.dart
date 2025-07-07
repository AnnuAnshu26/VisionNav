import 'dart:html' as html;
import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';

import '../platform_view_registry_stub.dart'
    if (dart.library.html) '../platform_view_registry_web.dart';

class ObjectDetectionScreen extends StatefulWidget {
  @override
  _ObjectDetectionScreenState createState() => _ObjectDetectionScreenState();
}

class _ObjectDetectionScreenState extends State<ObjectDetectionScreen> {
  final FlutterTts flutterTts = FlutterTts();
  late html.DivElement _wrapperDiv;

  @override
  void initState() {
    super.initState();
    _announceDetection();
    _initTFJSObjectDetection();
  }

  void _announceDetection() async {
    await flutterTts.speak('Object detection is now active using TensorFlow');
  }

  void _initTFJSObjectDetection() {
    _wrapperDiv = html.DivElement()
      ..id = 'tfjs-wrapper'
      ..style.position = 'relative'
      ..style.width = '640px'
      ..style.height = '480px'
      ..style.border = '2px solid #000';

    getPlatformViewRegistry().registerViewFactory(
      'tfjs-wrapper',
      (int viewId) => _wrapperDiv,
    );

    final tfjsScript = html.ScriptElement()
      ..src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs'
      ..type = 'application/javascript'
      ..onLoad.listen((event) {
        final cocoScript = html.ScriptElement()
          ..src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd'
          ..type = 'application/javascript'
          ..onLoad.listen((event) {
            final detectionScript = html.ScriptElement()
              ..type = 'application/javascript'
              ..innerHtml = """
                (async function() {
                  let video = document.createElement('video');
                  video.width = 640;
                  video.height = 480;
                  video.autoplay = true;
                  video.style.position = 'absolute';
                  video.style.top = '0';
                  video.style.left = '0';
                  document.getElementById('tfjs-wrapper').appendChild(video);

                  let canvas = document.createElement('canvas');
                  canvas.width = 640;
                  canvas.height = 480;
                  canvas.style.position = 'absolute';
                  canvas.style.top = '0';
                  canvas.style.left = '0';
                  canvas.style.zIndex = '10';
                  document.getElementById('tfjs-wrapper').appendChild(canvas);
                  let ctx = canvas.getContext('2d');

                  let lastSpoken = "";

                  async function startCamera(facing = 'environment') {
                    try {
                      const stream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: facing } // ✅ FIXED: No OverconstrainedError
                      });
                      video.srcObject = stream;
                    } catch (e) {
                      console.error("Camera error:", e);
                    }
                  }

                  await startCamera();

                  const model = await cocoSsd.load();
                  console.log("Model loaded");

                  async function detectFrame() {
                    const predictions = await model.detect(video);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    if (predictions.length > 0) {
                      const current = predictions.map(p => p.class).join(', ');
                      if (current !== lastSpoken) {
                        window.parent.postMessage({ type: 'speak', data: current }, '*');
                        lastSpoken = current;
                      }
                    }

                    predictions.forEach(pred => {
                      const [x, y, width, height] = pred.bbox;
                      ctx.strokeStyle = '#00FF00';
                      ctx.lineWidth = 2;
                      ctx.strokeRect(x, y, width, height);

                      ctx.font = '14px Arial';
                      ctx.fillStyle = 'black';
                      ctx.fillText(pred.class, x, y > 10 ? y - 5 : 10);
                    });

                    requestAnimationFrame(detectFrame);
                  }

                  detectFrame();

                  // Handle camera switch from Flutter
                  window.addEventListener('message', (e) => {
                    if (e.data.type === 'switchCamera') {
                      startCamera(e.data.facing);
                    }
                  });
                })();
              """;

            html.document.body?.append(detectionScript);
          });

        html.document.body?.append(cocoScript);
      });

    html.document.body?.append(tfjsScript);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    html.window.onMessage.listen((event) {
      if (event.data is Map && event.data['type'] == 'speak') {
        String objects = event.data['data'];
        flutterTts.speak("I see: $objects");
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('TFJS Object Detection')),
      body: Stack(
        children: [
          Center(child: HtmlElementView(viewType: 'tfjs-wrapper')),
          Positioned(
            bottom: 20,
            left: 20,
            child: ElevatedButton(
              onPressed: () {
                html.window.postMessage(
                  {'type': 'switchCamera', 'facing': 'user'},
                  '*',
                );
              },
              child: Text('Front Camera'),
            ),
          ),
          Positioned(
            bottom: 20,
            right: 20,
            child: ElevatedButton(
              onPressed: () {
                html.window.postMessage(
                  {'type': 'switchCamera', 'facing': 'environment'},
                  '*',
                );
              },
              child: Text('Rear Camera'),
            ),
          ),
        ],
      ),
    );
  }
}
import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:geolocator/geolocator.dart';
import 'package:url_launcher/url_launcher.dart';

class SosScreen extends StatefulWidget {
  @override
  _SosScreenState createState() => _SosScreenState();
}

class _SosScreenState extends State<SosScreen> {
  final FlutterTts flutterTts = FlutterTts();
  bool _hasSent = false;

  @override
  void initState() {
    super.initState();
    _sendSos();
  }

  Future<void> _sendSos() async {
    if (_hasSent) return;
    _hasSent = true;

    try {
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      String message = 'Emergency! My location: https://www.google.com/maps?q=${position.latitude},${position.longitude}';
      final Uri url = Uri.parse(
        'https://wa.me/918527904606?text=${Uri.encodeComponent(message)}',
      );

      await flutterTts.speak('Sending SOS alert to your trusted contact');

      if (await canLaunchUrl(url)) {
        await launchUrl(url, webOnlyWindowName: '_self');
      } else {
        await flutterTts.speak('Could not launch WhatsApp');
      }
    } catch (e) {
      await flutterTts.speak('Failed to get location');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('SOS Alert')),
      body: Center(
        child: Text('Sending SOS...', style: TextStyle(fontSize: 18)),
      ),
    );
  }
}
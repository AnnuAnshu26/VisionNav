import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:url_launcher/url_launcher.dart';

class NavigationScreen extends StatefulWidget {
  final String destination;

  NavigationScreen({required this.destination});

  @override
  _NavigationScreenState createState() => _NavigationScreenState();
}

class _NavigationScreenState extends State<NavigationScreen> {
  final FlutterTts flutterTts = FlutterTts();
  bool _hasLaunched = false;

  @override
  void initState() {
    super.initState();
    _launchMaps(widget.destination);
  }

  void _launchMaps(String location) async {
    if (_hasLaunched) return; // prevent repeat
    _hasLaunched = true;

    final query = Uri.encodeComponent(location);
    final googleMapsUrl = Uri.parse('https://www.google.com/maps/search/?api=1&query=$query');

    if (await canLaunchUrl(googleMapsUrl)) {
      await flutterTts.speak('Navigating to $location');
      await launchUrl(googleMapsUrl, webOnlyWindowName: '_self'); // open in same tab
    } else {
      await flutterTts.speak('Could not launch maps');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Navigation')),
      body: Center(
        child: Text('Navigating to ${widget.destination}...', style: TextStyle(fontSize: 18)),
      ),
    );
  }
}
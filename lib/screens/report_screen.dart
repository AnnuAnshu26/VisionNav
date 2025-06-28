import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_tts/flutter_tts.dart';

class ReportScreen extends StatefulWidget {
  @override
  _ReportScreenState createState() => _ReportScreenState();
}

class _ReportScreenState extends State<ReportScreen> {
  final TextEditingController _controller = TextEditingController();
  final FlutterTts flutterTts = FlutterTts();
  String location = '';

  @override
  void initState() {
    super.initState();
    _fetchLocation();
  }

  void _fetchLocation() async {
    Position pos = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
    setState(() {
      location = 'Lat: ${pos.latitude}, Long: ${pos.longitude}';
    });
    await flutterTts.speak('Please describe the issue to report');
  }

  void _submitReport() async {
    String report = _controller.text;
    await flutterTts.speak('Report submitted: $report');
    // Send report with location to your backend/server/db if needed
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Report Unsafe Area')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Text('Your Location: $location'),
            SizedBox(height: 16),
            TextField(
              controller: _controller,
              decoration: InputDecoration(labelText: 'Describe the issue'),
              maxLines: 4,
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: _submitReport,
              child: Text('Submit'),
            )
          ],
        ),
      ),
    );
  }
}
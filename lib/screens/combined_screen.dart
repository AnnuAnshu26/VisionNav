import 'package:flutter/material.dart';
import 'navigation_screen.dart';
import 'object_detection_screen.dart';

class CombinedScreen extends StatelessWidget {
  final String destination;

  const CombinedScreen({super.key, required this.destination});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Navigation + Object Detection')),
      body: Row(
        children: [
          Expanded(
            child: NavigationScreen(destination: destination),
          ),
          VerticalDivider(width: 1),
          Expanded(
            child: ObjectDetectionScreen(),
          ),
        ],
      ),
    );
  }
}

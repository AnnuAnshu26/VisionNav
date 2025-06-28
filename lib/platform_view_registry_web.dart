// lib/platform_view_registry_web.dart

// Needed for Web only
// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;

// This imports the real platformViewRegistry on Web
// ignore: undefined_prefixed_name
import 'dart:ui_web' as ui_web;

dynamic getPlatformViewRegistry() => ui_web.platformViewRegistry;
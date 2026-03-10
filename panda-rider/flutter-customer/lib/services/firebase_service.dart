import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

class FirebaseService {
  static final FirebaseAuth _auth = FirebaseAuth.instance;
  static final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  static final FirebaseMessaging _messaging = FirebaseMessaging.instance;

  // Authentication
  static Future<UserCredential> signUp(
    String email,
    String password,
    String name,
    String phone,
  ) async {
    try {
      final userCredential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      await userCredential.user!.updateDisplayName(name);
      
      // Store user data in Firestore
      await _firestore.collection('users').doc(userCredential.user!.uid).set({
        'uid': userCredential.user!.uid,
        'email': email,
        'name': name,
        'phone': phone,
        'userType': 'customer',
        'createdAt': DateTime.now(),
        'rating': 0,
        'totalRides': 0,
        'isVerified': false,
      });

      return userCredential;
    } catch (e) {
      rethrow;
    }
  }

  static Future<UserCredential> signIn(String email, String password) async {
    return await _auth.signInWithEmailAndPassword(
      email: email,
      password: password,
    );
  }

  static Future<void> signOut() async {
    await _auth.signOut();
  }

  static User? getCurrentUser() {
    return _auth.currentUser;
  }

  // Firestore
  static Future<DocumentSnapshot> getUserData(String uid) async {
    return await _firestore.collection('users').doc(uid).get();
  }

  static Stream<DocumentSnapshot> getUserDataStream(String uid) {
    return _firestore.collection('users').doc(uid).snapshots();
  }

  static Future<void> updateUserData(String uid, Map<String, dynamic> data) async {
    await _firestore.collection('users').doc(uid).update(data);
  }

  static Stream<QuerySnapshot> getTripUpdates(String userId) {
    return _firestore
        .collection('trips')
        .where('userId', isEqualTo: userId)
        .orderBy('createdAt', descending: true)
        .snapshots();
  }

  static Stream<QuerySnapshot> getDriverLocationUpdates(String tripId) {
    return _firestore
        .collection('trips')
        .doc(tripId)
        .collection('locationUpdates')
        .orderBy('timestamp', descending: true)
        .limit(1)
        .snapshots();
  }

  static Future<void> updateTripLocation(
    String tripId,
    double latitude,
    double longitude,
  ) async {
    await _firestore
        .collection('trips')
        .doc(tripId)
        .collection('locationUpdates')
        .add({
      'latitude': latitude,
      'longitude': longitude,
      'timestamp': DateTime.now(),
    });
  }

  // Push Notifications
  static Future<void> initializeMessaging() async {
    // Request notification permission
    await _messaging.requestPermission();

    // Get device token
    final token = await _messaging.getToken();
    
    // Handle foreground messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      if (message.notification != null) {
        // Handle notification
      }
    });

    // Handle background message tap
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      // Handle message when app is opened from notification
    });
  }

  static Future<String?> getDeviceToken() async {
    return await _messaging.getToken();
  }

  static Future<void> subscribeToTopic(String topic) async {
    await _messaging.subscribeToTopic(topic);
  }

  static Future<void> unsubscribeFromTopic(String topic) async {
    await _messaging.unsubscribeFromTopic(topic);
  }
}

import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class FirebaseService {
  static final FirebaseAuth _auth = FirebaseAuth.instance;
  static final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  static Future<UserCredential> signUp(String email, String password, String name, String phone) async {
    final userCredential = await _auth.createUserWithEmailAndPassword(
      email: email,
      password: password,
    );
    
    await _firestore.collection('drivers').doc(userCredential.user!.uid).set({
      'uid': userCredential.user!.uid,
      'email': email,
      'name': name,
      'phone': phone,
      'userType': 'driver',
      'isOnline': false,
      'rating': 0,
      'totalTrips': 0,
      'earnings': 0,
      'isVerified': false,
      'createdAt': DateTime.now(),
    });
    
    return userCredential;
  }

  static Future<UserCredential> signIn(String email, String password) async {
    return await _auth.signInWithEmailAndPassword(email: email, password: password);
  }

  static Future<void> signOut() async {
    await _auth.signOut();
  }

  static User? getCurrentUser() {
    return _auth.currentUser;
  }

  static Future<DocumentSnapshot> getDriver(String driverId) async {
    return await _firestore.collection('drivers').doc(driverId).get();
  }

  static Future<void> updateDriver(String driverId, Map<String, dynamic> data) async {
    await _firestore.collection('drivers').doc(driverId).update(data);
  }

  static Future<void> initializeMessaging() async {
    // FCM setup
  }

  static Stream<QuerySnapshot> getAvailableTrips() {
    return _firestore
        .collection('trips')
        .where('status', isEqualTo: 'requesting')
        .snapshots();
  }
}

import 'package:flutter/material.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: CircleAvatar(
                radius: 50,
                child: Icon(Icons.person, size: 40),
              ),
            ),
            const SizedBox(height: 16),
            Center(child: Text('John Doe', style: Theme.of(context).textTheme.headlineSmall)),
            const SizedBox(height: 32),
            Text('Verification Status', style: Theme.of(context).textTheme.labelLarge),
            const SizedBox(height: 12),
            ListTile(
              title: const Text('License Verified'),
              trailing: const Icon(Icons.check_circle, color: Colors.green),
            ),
            ListTile(
              title: const Text('Vehicle Verified'),
              trailing: const Icon(Icons.check_circle, color: Colors.green),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () => Navigator.of(context).pushReplacementNamed('/login'),
                child: const Text('Logout'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

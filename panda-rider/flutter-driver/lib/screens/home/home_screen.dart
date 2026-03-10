import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/app_theme.dart';
import '../../providers/driver_provider.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Panda Rider Driver'),
        elevation: 0,
      ),
      body: Consumer<DriverProvider>(
        builder: (context, driverProvider, child) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Status', style: Theme.of(context).textTheme.bodyMedium),
                            const SizedBox(height: 8),
                            Text(
                              driverProvider.isOnline ? 'Online' : 'Offline',
                              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                color: driverProvider.isOnline ? AppTheme.successColor : Colors.red,
                              ),
                            ),
                          ],
                        ),
                        Switch(
                          value: driverProvider.isOnline,
                          onChanged: (_) => driverProvider.toggleOnlineStatus(),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Text('Available Trips', style: Theme.of(context).textTheme.headlineSmall),
                const SizedBox(height: 12),
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: 3,
                  itemBuilder: (context, index) {
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Trip #${index + 1}', style: Theme.of(context).textTheme.labelLarge),
                            const SizedBox(height: 8),
                            Text('From: Location A', style: Theme.of(context).textTheme.bodySmall),
                            Text('To: Location B', style: Theme.of(context).textTheme.bodySmall),
                            const SizedBox(height: 8),
                            Text('\$15.50', style: Theme.of(context).textTheme.labelLarge?.copyWith(color: AppTheme.secondaryColor)),
                            const SizedBox(height: 12),
                            ElevatedButton(
                              onPressed: () {},
                              child: const Text('Accept'),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          );
        },
      ),
      bottomNavigationBar: BottomNavigationBar(
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.trending_up), label: 'Earnings'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
        onTap: (index) {
          if (index == 1) Navigator.of(context).pushNamed('/earnings');
          if (index == 2) Navigator.of(context).pushNamed('/profile');
        },
      ),
    );
  }
}

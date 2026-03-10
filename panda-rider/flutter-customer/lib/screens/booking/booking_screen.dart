import 'package:flutter/material.dart';
import '../../config/app_theme.dart';
import '../../models/models.dart';

class BookingScreen extends StatefulWidget {
  const BookingScreen({Key? key}) : super(key: key);

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  final _pickupController = TextEditingController();
  final _dropoffController = TextEditingController();
  String _selectedService = 'ride';
  String _selectedSchedule = 'now';
  double _estimatedFare = 0;

  @override
  void dispose() {
    _pickupController.dispose();
    _dropoffController.dispose();
    super.dispose();
  }

  void _calculateFare() {
    // Placeholder fare calculation
    setState(() {
      _estimatedFare = 15.50;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Request a ride'),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Service Type',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildServiceOption('ride', 'Ride', Icons.directions_car),
                _buildServiceOption('delivery', 'Food', Icons.restaurant),
                _buildServiceOption('courier', 'Courier', Icons.local_shipping),
              ],
            ),
            const SizedBox(height: 32),
            Text(
              'Locations',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _pickupController,
              decoration: const InputDecoration(
                labelText: 'Pickup Location',
                prefixIcon: Icon(Icons.location_on),
                hintText: 'Enter pickup location',
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _dropoffController,
              decoration: const InputDecoration(
                labelText: 'Dropoff Location',
                prefixIcon: Icon(Icons.location_on_outlined),
                hintText: 'Enter dropoff location',
              ),
              onChanged: (_) => _calculateFare(),
            ),
            const SizedBox(height: 32),
            Text(
              'Schedule',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: _selectedSchedule == 'now'
                        ? null
                        : () => setState(() => _selectedSchedule = 'now'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _selectedSchedule == 'now'
                          ? AppTheme.secondaryColor
                          : AppTheme.borderColor,
                    ),
                    child: const Text('Now'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _selectedSchedule == 'later'
                        ? null
                        : () => setState(() => _selectedSchedule = 'later'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _selectedSchedule == 'later'
                          ? AppTheme.secondaryColor
                          : AppTheme.borderColor,
                    ),
                    child: const Text('Later'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.backgroundColor,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Estimated Fare',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '\$${_estimatedFare.toStringAsFixed(2)}',
                    style: Theme.of(context).textTheme.displayLarge?.copyWith(
                          color: AppTheme.secondaryColor,
                        ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pushNamed('/tracking');
                },
                child: const Text('Request Ride'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildServiceOption(String value, String label, IconData icon) {
    final isSelected = _selectedService == value;
    return GestureDetector(
      onTap: () => setState(() => _selectedService = value),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.secondaryColor : AppTheme.backgroundColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color:
                isSelected ? AppTheme.secondaryColor : AppTheme.borderColor,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              color:
                  isSelected ? Colors.white : AppTheme.textPrimaryColor,
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : AppTheme.textPrimaryColor,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import '../../config/app_theme.dart';

class EarningsScreen extends StatefulWidget {
  const EarningsScreen({Key? key}) : super(key: key);

  @override
  State<EarningsScreen> createState() => _EarningsScreenState();
}

class _EarningsScreenState extends State<EarningsScreen> {
  String _selectedPeriod = 'today';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Earnings')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: ['today', 'week', 'month'].map((period) {
                return FilterChip(
                  label: Text(period.toUpperCase()),
                  selected: _selectedPeriod == period,
                  onSelected: (selected) => setState(() => _selectedPeriod = period),
                );
              }).toList(),
            ),
            const SizedBox(height: 24),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Total Earnings', style: Theme.of(context).textTheme.bodyMedium),
                    const SizedBox(height: 8),
                    Text(
                      '\$245.50',
                      style: Theme.of(context).textTheme.displayLarge?.copyWith(color: AppTheme.successColor),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            Text('Trip Summary', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 12),
            _buildSummaryRow('Completed Trips', '12'),
            _buildSummaryRow('Cancelled Trips', '2'),
            _buildSummaryRow('Avg Rating', '4.8'),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

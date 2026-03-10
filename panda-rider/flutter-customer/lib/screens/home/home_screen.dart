import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../config/app_theme.dart';
import '../../services/location_service.dart';
import '../../models/models.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late GoogleMapController _mapController;
  LatLng _currentLocation = const LatLng(0, 0);
  final _searchController = TextEditingController();
  String _selectedService = 'ride';

  @override
  void initState() {
    super.initState();
    _initializeLocation();
  }

  Future<void> _initializeLocation() async {
    try {
      final position = await LocationService.getCurrentLocation();
      if (position != null) {
        setState(() {
          _currentLocation = LatLng(position.latitude, position.longitude);
        });

        if (_mapController != null) {
          _mapController.animateCamera(
            CameraUpdateOptions(
              bounds: CameraUpdateBounds(
                bounds: LatLngBounds(
                  southwest: _currentLocation,
                  northeast: _currentLocation,
                ),
              ),
              zoom: 15,
            ),
          );
        }
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error getting location: ${e.toString()}')),
      );
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    _mapController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          GoogleMap(
            initialCameraPosition: CameraPosition(
              target: _currentLocation,
              zoom: 15,
            ),
            onMapCreated: (controller) {
              _mapController = controller;
            },
            myLocationEnabled: true,
            myLocationButtonEnabled: true,
          ),
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    TextField(
                      controller: _searchController,
                      decoration: InputDecoration(
                        hintText: 'Where to?',
                        prefixIcon: const Icon(Icons.location_on_outlined),
                        filled: true,
                        fillColor: AppTheme.surfaceColor,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      onTap: () {
                        Navigator.of(context).pushNamed('/booking');
                      },
                    ),
                    const SizedBox(height: 12),
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: [
                          _buildServiceChip('ride', 'Ride', Icons.directions_car),
                          const SizedBox(width: 8),
                          _buildServiceChip('delivery', 'Food', Icons.restaurant),
                          const SizedBox(width: 8),
                          _buildServiceChip('courier', 'Courier', Icons.local_shipping),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildServiceChip(String value, String label, IconData icon) {
    final isSelected = _selectedService == value;
    return FilterChip(
      selected: isSelected,
      label: Row(
        children: [
          Icon(icon, size: 16),
          const SizedBox(width: 4),
          Text(label),
        ],
      ),
      backgroundColor: AppTheme.surfaceColor,
      selectedColor: AppTheme.secondaryColor,
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : AppTheme.textPrimaryColor,
      ),
      onSelected: (_) {
        setState(() => _selectedService = value);
      },
    );
  }
}

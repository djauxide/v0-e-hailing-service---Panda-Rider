import express, { Router } from 'express';
import { reportingService } from '../services/reporting.service';

const router = Router();

// Generate Revenue Report
router.post('/revenue', async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.body;
    const report = await reportingService.generateRevenueReport({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      groupBy: groupBy || 'daily',
    });
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate Driver Performance Report
router.post('/driver-performance', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const report = await reportingService.generateDriverPerformanceReport({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate User Acquisition Report
router.post('/user-acquisition', async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.body;
    const report = await reportingService.generateUserAcquisitionReport({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      groupBy: groupBy || 'daily',
    });
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate Payment Method Report
router.post('/payment-methods', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const report = await reportingService.generatePaymentMethodReport({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate Fraud Detection Report
router.post('/fraud-detection', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const report = await reportingService.generateFraudDetectionReport({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate Service Area Report
router.post('/service-area', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const report = await reportingService.generateServiceAreaReport({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export report to CSV
router.post('/export-csv', async (req, res) => {
  try {
    const { report } = req.body;
    const csv = await reportingService.exportToCsv(report);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=report.csv');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

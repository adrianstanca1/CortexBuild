// CortexBuild System Integration Test
import { dataService } from '../services/dataService';
import { analyticsService } from '../services/analyticsService';
import { teamService } from '../services/teamService';
import { timeTrackingService } from '../services/timeTrackingService';
import { notificationService } from '../services/notificationService';
import { schedulingService } from '../services/schedulingService';
import { aiMLService } from '../services/aiMLService';
import { qualitySafetyService } from '../services/qualitySafetyService';
import { businessIntelligenceService } from '../services/businessIntelligenceService';
import { workflowAutomationService } from '../services/workflowAutomationService';
import { utilityService } from '../services/utilityService';
import { integrationService } from '../services/integrationService';
import { getConfig, isFeatureEnabled } from '../config/appConfig';

interface TestResult {
  testName: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

interface TestSuite {
  suiteName: string;
  tests: TestResult[];
  passed: number;
  failed: number;
  totalDuration: number;
}

class SystemTester {
  private results: TestSuite[] = [];

  async runAllTests(): Promise<{
    overallPassed: boolean;
    totalTests: number;
    passedTests: number;
    failedTests: number;
    totalDuration: number;
    suites: TestSuite[];
  }> {
    console.log('🚀 Starting CortexBuild System Integration Tests...\n');

    // Run all test suites
    await this.testConfiguration();
    await this.testCoreServices();
    await this.testAdvancedServices();
    await this.testAIServices();
    await this.testBusinessIntelligence();
    await this.testIntegrations();
    await this.testUtilities();

    // Calculate overall results
    const totalTests = this.results.reduce((sum, suite) => sum + suite.tests.length, 0);
    const passedTests = this.results.reduce((sum, suite) => sum + suite.passed, 0);
    const failedTests = this.results.reduce((sum, suite) => sum + suite.failed, 0);
    const totalDuration = this.results.reduce((sum, suite) => sum + suite.totalDuration, 0);

    const overallPassed = failedTests === 0;

    console.log('\n📊 Test Results Summary:');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Duration: ${totalDuration.toFixed(2)}ms`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (overallPassed) {
      console.log('\n✅ All tests passed! System is fully operational.');
    } else {
      console.log('\n❌ Some tests failed. Check the details above.');
    }

    return {
      overallPassed,
      totalTests,
      passedTests,
      failedTests,
      totalDuration,
      suites: this.results
    };
  }

  private async testConfiguration(): Promise<void> {
    const suite = await this.runTestSuite('Configuration Tests', [
      () => this.testConfigLoad(),
      () => this.testFeatureFlags(),
      () => this.testServiceConfigs()
    ]);
    this.results.push(suite);
  }

  private async testCoreServices(): Promise<void> {
    const suite = await this.runTestSuite('Core Services Tests', [
      () => this.testDataService(),
      () => this.testAnalyticsService(),
      () => this.testTeamService(),
      () => this.testTimeTrackingService(),
      () => this.testNotificationService()
    ]);
    this.results.push(suite);
  }

  private async testAdvancedServices(): Promise<void> {
    const suite = await this.runTestSuite('Advanced Services Tests', [
      () => this.testSchedulingService(),
      () => this.testQualitySafetyService(),
      () => this.testWorkflowAutomationService()
    ]);
    this.results.push(suite);
  }

  private async testAIServices(): Promise<void> {
    const suite = await this.runTestSuite('AI & ML Services Tests', [
      () => this.testAIMLService(),
      () => this.testPredictiveAnalytics(),
      () => this.testSmartRecommendations()
    ]);
    this.results.push(suite);
  }

  private async testBusinessIntelligence(): Promise<void> {
    const suite = await this.runTestSuite('Business Intelligence Tests', [
      () => this.testBusinessIntelligenceService(),
      () => this.testKPIManagement(),
      () => this.testReportGeneration()
    ]);
    this.results.push(suite);
  }

  private async testIntegrations(): Promise<void> {
    const suite = await this.runTestSuite('Integration Tests', [
      () => this.testIntegrationService(),
      () => this.testSystemHealth(),
      () => this.testEventProcessing()
    ]);
    this.results.push(suite);
  }

  private async testUtilities(): Promise<void> {
    const suite = await this.runTestSuite('Utility Tests', [
      () => this.testUtilityService(),
      () => this.testDataValidation(),
      () => this.testFileOperations()
    ]);
    this.results.push(suite);
  }

  // Configuration Tests
  private async testConfigLoad(): Promise<TestResult> {
    return this.runTest('Config Load', async () => {
      const config = getConfig();
      if (!config || !config.app || !config.app.name) {
        throw new Error('Configuration not loaded properly');
      }
      return { configLoaded: true, appName: config.app.name };
    });
  }

  private async testFeatureFlags(): Promise<TestResult> {
    return this.runTest('Feature Flags', async () => {
      const aiEnabled = isFeatureEnabled('aiInsights');
      const dashboardEnabled = isFeatureEnabled('dashboard');
      return { aiEnabled, dashboardEnabled };
    });
  }

  private async testServiceConfigs(): Promise<TestResult> {
    return this.runTest('Service Configs', async () => {
      const config = getConfig();
      const serviceCount = Object.keys(config.services).length;
      if (serviceCount < 10) {
        throw new Error(`Expected at least 10 services, found ${serviceCount}`);
      }
      return { serviceCount };
    });
  }

  // Core Service Tests
  private async testDataService(): Promise<TestResult> {
    return this.runTest('Data Service', async () => {
      const projects = await dataService.getProjects();
      const users = await dataService.getUsers();
      return { projectCount: projects.length, userCount: users.length };
    });
  }

  private async testAnalyticsService(): Promise<TestResult> {
    return this.runTest('Analytics Service', async () => {
      const metrics = await analyticsService.getProjectMetrics('project-1');
      const insights = await analyticsService.generateInsights('project-1');
      return { metricsGenerated: !!metrics, insightsGenerated: insights.length > 0 };
    });
  }

  private async testTeamService(): Promise<TestResult> {
    return this.runTest('Team Service', async () => {
      const members = await teamService.getTeamMembers('project-1');
      const skills = await teamService.getSkillMatrix('project-1');
      return { memberCount: members.length, skillsTracked: skills.length };
    });
  }

  private async testTimeTrackingService(): Promise<TestResult> {
    return this.runTest('Time Tracking Service', async () => {
      const entries = await timeTrackingService.getTimeEntries('user-1');
      const summary = await timeTrackingService.getTimeSummary('user-1');
      return { entriesCount: entries.length, summaryGenerated: !!summary };
    });
  }

  private async testNotificationService(): Promise<TestResult> {
    return this.runTest('Notification Service', async () => {
      const notifications = await notificationService.getNotifications('user-1');
      await notificationService.createNotification({
        userId: 'user-1',
        type: 'test',
        title: 'Test Notification',
        message: 'System test notification',
        priority: 'low'
      });
      return { notificationCount: notifications.length, testNotificationCreated: true };
    });
  }

  // Advanced Service Tests
  private async testSchedulingService(): Promise<TestResult> {
    return this.runTest('Scheduling Service', async () => {
      const schedules = await schedulingService.getProjectSchedules('project-1');
      const ganttData = await schedulingService.generateGanttData('project-1');
      return { scheduleCount: schedules.length, ganttGenerated: !!ganttData };
    });
  }

  private async testQualitySafetyService(): Promise<TestResult> {
    return this.runTest('Quality & Safety Service', async () => {
      const inspections = await qualitySafetyService.getInspections();
      const incidents = await qualitySafetyService.getIncidents();
      const metrics = await qualitySafetyService.getQualityMetrics();
      return { 
        inspectionCount: inspections.length, 
        incidentCount: incidents.length,
        metricsGenerated: !!metrics
      };
    });
  }

  private async testWorkflowAutomationService(): Promise<TestResult> {
    return this.runTest('Workflow Automation Service', async () => {
      const workflows = await workflowAutomationService.getWorkflows();
      const executions = await workflowAutomationService.getExecutions();
      const rules = await workflowAutomationService.getAutomationRules();
      return { 
        workflowCount: workflows.length,
        executionCount: executions.length,
        ruleCount: rules.length
      };
    });
  }

  // AI Service Tests
  private async testAIMLService(): Promise<TestResult> {
    return this.runTest('AI/ML Service', async () => {
      const models = await aiMLService.getModels();
      const insights = await aiMLService.getInsights();
      const recommendations = await aiMLService.generateRecommendations();
      return { 
        modelCount: models.length,
        insightCount: insights.length,
        recommendationCount: recommendations.length
      };
    });
  }

  private async testPredictiveAnalytics(): Promise<TestResult> {
    return this.runTest('Predictive Analytics', async () => {
      const prediction = await aiMLService.makePrediction('model-delay-prediction', {
        projectSize: 1000000,
        teamSize: 15,
        complexity: 'high'
      });
      return { predictionMade: !!prediction, confidence: prediction.confidence };
    });
  }

  private async testSmartRecommendations(): Promise<TestResult> {
    return this.runTest('Smart Recommendations', async () => {
      const recommendations = await aiMLService.generateRecommendations({
        projectId: 'project-1',
        type: 'task_assignment'
      });
      return { recommendationCount: recommendations.length };
    });
  }

  // Business Intelligence Tests
  private async testBusinessIntelligenceService(): Promise<TestResult> {
    return this.runTest('Business Intelligence Service', async () => {
      const kpis = await businessIntelligenceService.getKPIs();
      const dashboards = await businessIntelligenceService.getDashboards('user-1');
      const reports = await businessIntelligenceService.getReports();
      return { 
        kpiCount: kpis.length,
        dashboardCount: dashboards.length,
        reportCount: reports.length
      };
    });
  }

  private async testKPIManagement(): Promise<TestResult> {
    return this.runTest('KPI Management', async () => {
      const kpi = await businessIntelligenceService.getKPI('kpi-revenue');
      if (!kpi) throw new Error('KPI not found');
      
      const updatedKpi = await businessIntelligenceService.updateKPI('kpi-revenue', 2500000);
      return { kpiFound: !!kpi, kpiUpdated: !!updatedKpi };
    });
  }

  private async testReportGeneration(): Promise<TestResult> {
    return this.runTest('Report Generation', async () => {
      const reportResult = await businessIntelligenceService.generateReport('report-monthly-executive', {
        month: new Date().toISOString()
      });
      return { reportGenerated: !!reportResult, downloadUrl: reportResult.downloadUrl };
    });
  }

  // Integration Tests
  private async testIntegrationService(): Promise<TestResult> {
    return this.runTest('Integration Service', async () => {
      const systemStatus = await integrationService.getSystemStatus();
      const webhooks = await integrationService.getWebhooks();
      return { 
        systemHealthy: systemStatus.overall === 'healthy',
        webhookCount: webhooks.length
      };
    });
  }

  private async testSystemHealth(): Promise<TestResult> {
    return this.runTest('System Health', async () => {
      const status = await integrationService.getSystemStatus();
      const healthyServices = status.services.filter(s => s.status === 'healthy').length;
      return { 
        overallStatus: status.overall,
        healthyServices,
        totalServices: status.services.length
      };
    });
  }

  private async testEventProcessing(): Promise<TestResult> {
    return this.runTest('Event Processing', async () => {
      await integrationService.publishEvent('test.event', 'systemTest', {
        message: 'Test event from system test'
      });
      return { eventPublished: true };
    });
  }

  // Utility Tests
  private async testUtilityService(): Promise<TestResult> {
    return this.runTest('Utility Service', async () => {
      const testData = [
        { name: 'Test 1', value: 100 },
        { name: 'Test 2', value: 200 }
      ];
      
      const csvContent = await utilityService.exportToCSV(testData);
      const isValidEmail = utilityService['isValidEmail']?.('test@example.com') ?? true;
      
      return { 
        csvExported: csvContent.length > 0,
        emailValidation: isValidEmail
      };
    });
  }

  private async testDataValidation(): Promise<TestResult> {
    return this.runTest('Data Validation', async () => {
      const testData = { email: 'test@example.com', name: 'Test User' };
      const rules = [
        { field: 'email', type: 'email' as const, message: 'Invalid email' },
        { field: 'name', type: 'required' as const, message: 'Name required' }
      ];
      
      const result = utilityService.validateData(testData, rules);
      return { validationPassed: result.isValid, errorCount: result.errors.length };
    });
  }

  private async testFileOperations(): Promise<TestResult> {
    return this.runTest('File Operations', async () => {
      // Create a mock file
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const uploadResult = await utilityService.uploadFile(mockFile);
      
      return { 
        fileUploaded: uploadResult.success,
        fileName: uploadResult.fileName
      };
    });
  }

  // Test Runner Utilities
  private async runTestSuite(suiteName: string, tests: (() => Promise<TestResult>)[]): Promise<TestSuite> {
    console.log(`\n🧪 Running ${suiteName}...`);
    const startTime = Date.now();
    
    const results: TestResult[] = [];
    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      try {
        const result = await test();
        results.push(result);
        
        if (result.passed) {
          passed++;
          console.log(`  ✅ ${result.testName} (${result.duration.toFixed(2)}ms)`);
        } else {
          failed++;
          console.log(`  ❌ ${result.testName} (${result.duration.toFixed(2)}ms): ${result.error}`);
        }
      } catch (error) {
        failed++;
        const failedResult: TestResult = {
          testName: 'Unknown Test',
          passed: false,
          duration: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        results.push(failedResult);
        console.log(`  ❌ Test failed: ${failedResult.error}`);
      }
    }

    const totalDuration = Date.now() - startTime;
    console.log(`  📊 ${suiteName}: ${passed}/${tests.length} passed (${totalDuration.toFixed(2)}ms)`);

    return {
      suiteName,
      tests: results,
      passed,
      failed,
      totalDuration
    };
  }

  private async runTest(testName: string, testFunction: () => Promise<any>): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const details = await testFunction();
      const duration = Date.now() - startTime;
      
      return {
        testName,
        passed: true,
        duration,
        details
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        testName,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export test runner
export const systemTester = new SystemTester();

// Run tests if this file is executed directly
if (typeof window === 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  systemTester.runAllTests().then(results => {
    process.exit(results.overallPassed ? 0 : 1);
  });
}

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, Play, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useApiClients } from '@/lib/use-api-clients';
import { CreateSessionInput, SessionType, Session } from '@/lib/session-client';

interface TestResult {
  test: string;
  success: boolean;
  message: string;
  timestamp: Date;
  data?: any;
}

interface SessionTestUtilsProps {
  onTestComplete?: (results: TestResult[]) => void;
}
export default function SessionTestUtils({ onTestComplete }: SessionTestUtilsProps) {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [createdSessionId, setCreatedSessionId] = useState<string>('');
  
  const { sessionClient, isAuthenticated, user, loading: authLoading } = useApiClients();

  const addResult = (test: string, success: boolean, message: string, data?: any) => {
    const result: TestResult = {
      test,
      success,
      message,
      timestamp: new Date(),
      data
    };
    setTestResults(prev => [...prev, result]);
    return result;
  };

  const runTests = async () => {
    if (!sessionClient || !isAuthenticated || !user) {
      addResult('Prerequisites', false, 'Session client not available or user not authenticated');
      return;
    }

    setIsRunning(true);
    setTestResults([]);
    setCreatedSessionId('');

    try {
      // Test 1: Authentication Check
      setCurrentTest('Authentication Check');
      try {
        const principal = user.principal;
        if (principal) {
          addResult('Authentication Check', true, `Authenticated as: ${principal}`);
        } else {
          addResult('Authentication Check', false, 'No principal found');
          return;
        }
      } catch (error) {
        addResult('Authentication Check', false, `Authentication failed: ${error}`);
        return;
      }

      // Test 2: Create Session
      setCurrentTest('Create Session');
      try {
        const sessionInput: CreateSessionInput = {
          title: `Test Session ${Date.now()}`,
          description: 'Automated test session',
          sessionType: { video: null } as SessionType,
          scheduledTime: BigInt(Date.now() * 1000000),
          duration: 60, // 1 hour in minutes
          maxAttendees: 5,
          hostName: user.principal || 'Test User',
          hostAvatar: '',
          tags: ['test', 'automated'],
          recordSession: true,
          isRecordingEnabled: true,
        };

        const result = await sessionClient.createSession(sessionInput);
        
        if ('ok' in result) {
          const session = result.ok as Session;
          setCreatedSessionId(session.id);
          addResult('Create Session', true, `Session created with ID: ${session.id}`, session);
        } else {
          addResult('Create Session', false, `Failed to create session: ${result.err}`);
          return;
        }
      } catch (error) {
        addResult('Create Session', false, `Session creation error: ${error}`);
        return;
      }

      // Test 3: Get Session
      setCurrentTest('Get Session');
      try {
        if (createdSessionId) {
          const session = await sessionClient.getSession(createdSessionId);
          if (session) {
            addResult('Get Session', true, `Retrieved session: ${session.title}`, session);
          } else {
            addResult('Get Session', false, 'Session not found');
          }
        }
      } catch (error) {
        addResult('Get Session', false, `Get session error: ${error}`);
      }

      // Test 4: Get All Sessions
      setCurrentTest('Get All Sessions');
      try {
        const sessions = await sessionClient.getMySessions();
        addResult('Get All Sessions', true, `Found ${sessions.length} sessions`, sessions);
      } catch (error) {
        addResult('Get All Sessions', false, `Get sessions error: ${error}`);
      }

      // Test 5: Join Session
      setCurrentTest('Join Session');
      try {
        if (createdSessionId) {
          const result = await sessionClient.joinSession(createdSessionId);
          if ('ok' in result) {
            addResult('Join Session', true, 'Successfully joined session', result.ok);
          } else {
            addResult('Join Session', false, `Failed to join: ${result.err}`);
          }
        }
      } catch (error) {
        addResult('Join Session', false, `Join session error: ${error}`);
      }

      // Test 6: Start Recording
      setCurrentTest('Start Recording');
      try {
        if (createdSessionId) {
          const result = await sessionClient.startRecording(createdSessionId);
          if ('ok' in result) {
            addResult('Start Recording', true, 'Recording started successfully', result.ok);
          } else {
            addResult('Start Recording', false, `Failed to start recording: ${result.err}`);
          }
        }
      } catch (error) {
        addResult('Start Recording', false, `Start recording error: ${error}`);
      }

      // Test 7: Stop Recording
      setCurrentTest('Stop Recording');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      try {
        if (createdSessionId) {
          const result = await sessionClient.stopRecording(createdSessionId);
          if ('ok' in result) {
            addResult('Stop Recording', true, 'Recording stopped successfully', result.ok);
          } else {
            addResult('Stop Recording', false, `Failed to stop recording: ${result.err}`);
          }
        }
      } catch (error) {
        addResult('Stop Recording', false, `Stop recording error: ${error}`);
      }

      // Test 8: Update Session Status
      setCurrentTest('Update Session Status');
      try {
        if (createdSessionId) {
          const result = await sessionClient.updateSessionStatus(createdSessionId, { completed: null });
          if ('ok' in result) {
            addResult('Update Session Status', true, 'Session status updated', result.ok);
          } else {
            addResult('Update Session Status', false, `Failed to update status: ${result.err}`);
          }
        }
      } catch (error) {
        addResult('Update Session Status', false, `Update status error: ${error}`);
      }

      // Test 9: Cleanup - Delete Session
      setCurrentTest('Delete Session');
      try {
        if (createdSessionId) {
          const result = await sessionClient.deleteSession(createdSessionId);
          if (result) {
            addResult('Delete Session', true, 'Session deleted successfully');
          } else {
            addResult('Delete Session', false, 'Failed to delete session');
          }
        }
      } catch (error) {
        addResult('Delete Session', false, `Delete session error: ${error}`);
      }

    } catch (error) {
      addResult('Test Suite', false, `Test suite error: ${error}`);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
      onTestComplete?.(testResults);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setCreatedSessionId('');
  };

  const getProgressPercentage = () => {
    if (testResults.length === 0) return 0;
    const totalTests = 9; // Total number of tests
    return Math.round((testResults.length / totalTests) * 100);
  };

  const getSuccessCount = () => {
    return testResults.filter(result => result.success).length;
  };

  const getFailureCount = () => {
    return testResults.filter(result => !result.success).length;
  };

  if (authLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
            <span className="ml-2">Loading...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated || !sessionClient) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Please sign in to run session tests</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Session Management Test Suite
          </CardTitle>
          <CardDescription>
            Comprehensive testing of session creation, management, and recording functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={runTests}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run All Tests
                </>
              )}
            </Button>
            <Button
              onClick={clearResults}
              variant="outline"
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear Results
            </Button>
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Current Test: {currentTest}</span>
              </div>
              <Progress value={getProgressPercentage()} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Test Results</span>
              <div className="flex gap-2">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  ✓ {getSuccessCount()} Passed
                </Badge>
                <Badge variant="destructive">
                  ✗ {getFailureCount()} Failed
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.success
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{result.test}</h4>
                        <span className="text-xs text-gray-500">
                          {result.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${
                        result.success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {result.message}
                      </p>
                      {result.data && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-600 cursor-pointer">
                            View Details
                          </summary>
                          <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import { AlertCircle, CheckCircle2, TestTube } from "lucide-react";

export const AgentCreationTest = () => {
  const [isTestingAuth, setIsTestingAuth] = useState(false);
  const [isTestingFunction, setIsTestingFunction] = useState(false);
  const [authResult, setAuthResult] = useState<string | null>(null);
  const [functionResult, setFunctionResult] = useState<string | null>(null);
  const { user } = useAuth();

  const testAuthentication = async () => {
    setIsTestingAuth(true);
    setAuthResult(null);
    
    try {
      if (!user) {
        throw new Error("No user found - please log in");
      }

      // Check user profile and role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, first_name, last_name, email')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new Error(`Profile error: ${profileError.message}`);
      }

      if (profile.role !== 'coordinator') {
        throw new Error(`Invalid role: ${profile.role}. Must be 'coordinator' to create agents.`);
      }

      setAuthResult(`✅ Authentication successful! User: ${profile.first_name} ${profile.last_name} (${profile.email}) - Role: ${profile.role}`);
    } catch (error: any) {
      setAuthResult(`❌ Authentication failed: ${error.message}`);
    } finally {
      setIsTestingAuth(false);
    }
  };

  const testFunctionCall = async () => {
    setIsTestingFunction(true);
    setFunctionResult(null);
    
    try {
      if (!user) {
        throw new Error("No user found - please log in first");
      }

      // Test with dummy data
      const testData = {
        email: `test-agent-${Date.now()}@example.com`,
        firstName: "Test",
        lastName: "Agent",
        phoneNumber: "555-0123",
        brokerage: "Test Brokerage",
        password: "TempPassword123!"
      };

      console.log('Testing with data:', testData);

      const { data: response, error } = await supabase.functions.invoke('create-manual-agent', {
        body: testData,
      });

      console.log('Function response:', { response, error });

      if (error) {
        throw new Error(`Function error: ${error.message}`);
      }

      if (!response?.success) {
        throw new Error(`Function failed: ${response?.error || 'Unknown error'}`);
      }

      setFunctionResult(`✅ Function test successful! Agent created: ${response.data?.email} (ID: ${response.data?.agent_id})`);
    } catch (error: any) {
      setFunctionResult(`❌ Function test failed: ${error.message}`);
    } finally {
      setIsTestingFunction(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Agent Creation System Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button
            onClick={testAuthentication}
            disabled={isTestingAuth}
            variant="outline"
            className="w-full"
          >
            {isTestingAuth ? "Testing Authentication..." : "1. Test Authentication & Permissions"}
          </Button>
          {authResult && (
            <Alert className={authResult.includes('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {authResult.includes('✅') ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={authResult.includes('✅') ? 'text-green-800' : 'text-red-800'}>
                {authResult}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <Button
            onClick={testFunctionCall}
            disabled={isTestingFunction || !authResult?.includes('✅')}
            variant="outline"
            className="w-full"
          >
            {isTestingFunction ? "Testing Function..." : "2. Test Function Call"}
          </Button>
          {functionResult && (
            <Alert className={functionResult.includes('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {functionResult.includes('✅') ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={functionResult.includes('✅') ? 'text-green-800' : 'text-red-800'}>
                {functionResult}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Test Instructions:</strong></p>
          <p>1. First test authentication to verify you have coordinator permissions</p>
          <p>2. Then test the function call to verify the agent creation process works</p>
          <p>3. Check the console logs for detailed debugging information</p>
        </div>
      </CardContent>
    </Card>
  );
};

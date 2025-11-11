import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, LogIn } from "lucide-react";
import { toast } from "sonner";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

const Admin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check for existing session on mount
    const session = localStorage.getItem('admin_session');
    if (session) {
      const { authenticated, timestamp } = JSON.parse(session);
      // Session expires after 24 hours
      const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000;
      return authenticated && !isExpired;
    }
    return false;
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verify credentials against database
      const { data, error } = await supabase.rpc('verify_admin_login', {
        p_username: username.trim(),
        p_password: password
      });

      if (error) {
        console.error("Login error:", error);
        toast.error("An error occurred during login. Please try again.");
      } else if (data === true) {
        setIsAuthenticated(true);
        // Store session in localStorage
        localStorage.setItem('admin_session', JSON.stringify({
          authenticated: true,
          timestamp: Date.now()
        }));
        toast.success("Welcome back, Admin!");
      } else {
        toast.error("Invalid credentials. Please check your username and password.");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    }

    setLoading(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_session');
  };

  if (isAuthenticated) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-glow">
        <CardHeader className="space-y-4">
          <div className="w-16 h-16 rounded-full bg-gradient-primary mx-auto flex items-center justify-center shadow-soft">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the admin panel</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90 gap-2"
              disabled={loading}
            >
              <LogIn className="w-4 h-4" />
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;

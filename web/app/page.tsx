import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  FileText,
  Shield,
  Smartphone,
  TrendingUp,
  Globe,
  CheckCircle,
  ArrowRight,
  Zap,
  Lock,
  BarChart3,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="w-full border-b border-b-foreground/10 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center p-4 px-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-primary">MANTIS</h1>
              <p className="text-xs text-muted-foreground">Traffic Infringement System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <AuthButton />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-blue-50 to-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <Badge className="mb-4" variant="outline">
              Multi-Agency Traffic Enforcement
            </Badge>
            <h2 className="text-5xl font-bold mb-6 text-foreground">
              Municipal & Traffic Infringement System
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Unified traffic enforcement platform across Fiji. Streamline infringement recording,
              management, and analytics for Police, LTA, and City Councils.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/login">
                <Button size="lg" className="gap-2">
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button size="lg" variant="outline">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card className="border-2">
              <CardHeader>
                <Building2 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Multi-Agency Support</CardTitle>
                <CardDescription>
                  Unified platform for Fiji Police Force, Land Transport Authority, and City Councils
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2">
              <CardHeader>
                <Smartphone className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Mobile-First</CardTitle>
                <CardDescription>
                  Native mobile app for officers with offline support, GPS tracking, and photo evidence
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-2">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Real-Time Analytics</CardTitle>
                <CardDescription>
                  Comprehensive dashboards with live reporting, trends, and performance insights
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="w-full py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Complete Enforcement Solution</h3>
            <p className="text-muted-foreground text-lg">
              Everything you need to manage traffic infringements efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <FileText className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Infringement Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Record violations via web or mobile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Workflow tracking and approvals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Photo evidence and digital signatures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Appeals management system</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">User & Team Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Role-based access control</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Team creation and assignments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Shift and route management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Officer performance tracking</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Analytics & Reporting</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Real-time dashboards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Custom report generation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Trend analysis and forecasting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Export to PDF, Excel, CSV</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Globe className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">GPS & Location</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Real-time GPS tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Location-based infringement recording</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Hotspot identification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Route optimization</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Payment Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Stripe, PayPal, M-Pesa support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Payment tracking and reconciliation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Automated payment reminders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Finance integration with GL codes</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Lock className="h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Security & Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Row-level security policies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Complete audit logging</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Biometric authentication</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Encrypted data storage</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="w-full py-20 px-6 bg-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Built with Modern Technology</h3>
            <p className="text-muted-foreground text-lg">
              Enterprise-grade stack for reliability and performance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Web Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Next.js 15</li>
                  <li>• React 19</li>
                  <li>• TypeScript</li>
                  <li>• Tailwind CSS</li>
                  <li>• shadcn/ui</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mobile App</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Expo SDK 54</li>
                  <li>• React Native</li>
                  <li>• TypeScript</li>
                  <li>• Offline-first</li>
                  <li>• Native features</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Backend</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• PostgreSQL 14+</li>
                  <li>• Supabase</li>
                  <li>• REST API</li>
                  <li>• Real-time subscriptions</li>
                  <li>• 100+ RLS policies</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Integrations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Payment gateways</li>
                  <li>• SMS & Email</li>
                  <li>• Cloud storage</li>
                  <li>• Analytics platforms</li>
                  <li>• Webhook support</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 px-6 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-6">Ready to Get Started?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join the unified traffic enforcement platform serving agencies across Fiji
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg" variant="secondary" className="gap-2">
                Create Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">MANTIS</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Multi-Agency National Traffic Infringement System
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/auth/login" className="hover:text-primary">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/auth/sign-up" className="hover:text-primary">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Documentation</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="https://github.com/taiatiniyara/MANTIS/blob/main/docs/INDEX.md" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    Getting Started
                  </a>
                </li>
                <li>
                  <a href="https://github.com/taiatiniyara/MANTIS/blob/main/docs/USER_JOURNEYS.md" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    User Guides
                  </a>
                </li>
                <li>
                  <a href="https://github.com/taiatiniyara/MANTIS/blob/main/docs/api-spec.md" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    API Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Technology</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    Next.js
                  </a>
                </li>
                <li>
                  <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    Supabase
                  </a>
                </li>
                <li>
                  <a href="https://expo.dev" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                    Expo
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 MANTIS. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Powered by{" "}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold hover:text-primary"
              >
                Supabase
              </a>
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

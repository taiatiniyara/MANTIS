import { Shield, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  const features = [
    {
      title: "Multi-Agency Platform",
      description: "Unified system for Fiji Police Force, LTA, and City Councils",
    },
    {
      title: "Real-Time Analytics",
      description: "Comprehensive dashboards with live performance tracking",
    },
    {
      title: "Mobile Integration",
      description: "Native mobile app for officers with offline capability",
    },
    {
      title: "Role-Based Access",
      description: "Secure access control for super admins, agency admins, and officers",
    },
    {
      title: "Document Management",
      description: "Digital signatures, templates, and PDF generation",
    },
    {
      title: "Payment Processing",
      description: "Integrated payment gateways with automatic reconciliation",
    },
  ];

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-12 text-white">
        <div>
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 mb-12">
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">MANTIS</h1>
              <p className="text-sm text-blue-100">Traffic Infringement System</p>
            </div>
          </Link>

          {/* Main Message */}
          <div className="mb-16">
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Unified Traffic<br />Enforcement Platform
            </h2>
            <p className="text-lg text-blue-100 leading-relaxed">
              Streamline infringement management across multiple agencies with
              real-time analytics, mobile integration, and comprehensive reporting.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex gap-3 items-start bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="h-5 w-5 text-blue-200" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-blue-100 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 pt-6">
          <p className="text-sm text-blue-100">
            © 2025 MANTIS. Internal system for authorized personnel only.
          </p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex flex-col justify-center p-6 md:p-12 lg:p-16 bg-background">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-xl">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">MANTIS</h1>
              <p className="text-xs text-muted-foreground">Traffic Infringement System</p>
            </div>
          </Link>
        </div>

        {/* Form Content */}
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
          </div>

          {children}

          {/* Mobile Features Preview */}
          <div className="lg:hidden mt-8 pt-8 border-t">
            <p className="text-sm text-muted-foreground text-center mb-4">
              What you'll get with MANTIS:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {features.slice(0, 4).map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 rounded-lg bg-muted/50"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold">{feature.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

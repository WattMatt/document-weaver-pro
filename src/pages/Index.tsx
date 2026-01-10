import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Layers, 
  Key, 
  Zap, 
  ArrowRight, 
  Check,
  Code2,
  Download,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: <Layers className="w-6 h-6" />,
    title: 'Drag & Drop Editor',
    description: 'Intuitive canvas with separate, editable elements. Move, resize, and style each component independently.',
  },
  {
    icon: <Code2 className="w-6 h-6" />,
    title: 'Dynamic Fields',
    description: 'Add placeholders that can be populated via API. Perfect for automated document generation.',
  },
  {
    icon: <Key className="w-6 h-6" />,
    title: 'Token Integration',
    description: 'Connect external applications with secure API tokens. Extract and generate PDFs programmatically.',
  },
  {
    icon: <Download className="w-6 h-6" />,
    title: 'PDF Generation',
    description: 'Export high-quality PDFs instantly. Share templates via public tokens for external access.',
  },
];

const capabilities = [
  'Text blocks with full typography control',
  'Tables with customizable rows and columns',
  'Image uploads and placement',
  'Dynamic fields for API integration',
  'Shapes, dividers, and decorative elements',
  'Headers and footers',
  'Signature fields',
  'Multiple page size support (A4, Letter, Legal)',
];

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">DocBuilder</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link to="/editor">
              <Button>
                Open Editor
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Professional PDF Template Builder
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Create, Edit & Generate
            <br />
            <span className="text-primary">PDF Templates</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Build professional document templates with our intuitive drag-and-drop editor. 
            Connect your applications via API tokens and automate PDF generation at scale.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link to="/editor">
              <Button size="lg" className="h-12 px-8">
                Start Building
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="h-12 px-8">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Powerful features designed for developers and businesses who need flexible document generation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities List */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Built for Flexibility</h2>
              <p className="text-muted-foreground mb-8">
                Every element in your template is independent and fully customizable. 
                Design once, generate thousands of documents with dynamic data.
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                {capabilities.map((capability, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">{capability}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted/50 rounded-xl p-8 border">
              <div className="bg-card rounded-lg shadow-lg p-6 space-y-4">
                <div className="h-8 bg-primary/20 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-5/6"></div>
                  <div className="h-3 bg-muted rounded w-4/6"></div>
                </div>
                <div className="flex gap-4 pt-4">
                  <div className="h-20 bg-muted rounded flex-1"></div>
                  <div className="h-20 bg-muted rounded flex-1"></div>
                </div>
                <div className="h-24 bg-muted/50 rounded border-2 border-dashed"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API Integration Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-card border px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Shield className="w-4 h-4 text-primary" />
              Secure API Integration
            </div>
            <h2 className="text-3xl font-bold mb-4">Connect Your Applications</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Generate PDF documents programmatically using our REST API. 
              Create tokens with granular permissions for secure access.
            </p>
          </div>

          <div className="bg-card rounded-xl border overflow-hidden">
            <div className="bg-muted/50 px-4 py-2 border-b flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive/50"></div>
              <div className="w-3 h-3 rounded-full bg-warning/50"></div>
              <div className="w-3 h-3 rounded-full bg-success/50"></div>
              <span className="text-xs text-muted-foreground ml-2">API Example</span>
            </div>
            <pre className="p-6 text-sm overflow-x-auto">
              <code className="text-muted-foreground">
{`// Generate PDF with dynamic data
const response = await fetch('/api/v1/generate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer int_your_token_here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    template_id: 'invoice-template',
    data: {
      customer_name: 'Acme Corp',
      invoice_number: 'INV-2024-001',
      items: [
        { description: 'Service A', amount: 500 },
        { description: 'Service B', amount: 750 }
      ]
    }
  })
});

const pdf = await response.blob();`}
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Build?</h2>
          <p className="text-muted-foreground mb-8">
            Start creating professional PDF templates in minutes. No credit card required.
          </p>
          <Link to="/editor">
            <Button size="lg" className="h-12 px-10">
              Open the Editor
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>DocBuilder</span>
          </div>
          <p>Build beautiful PDF templates with ease</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { DarkVeil } from "@/components/ui/dark-veil";
import {
  FileText,
  Check,
  Star,
  Zap,
  Download,
  Users,
  Crown,
} from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "3 Professional Templates",
      "Basic Resume Builder",
      "ATS Optimization",
      "PDF Download",
      "1 Resume at a time",
    ],
    cta: "Get Started",
    popular: false,
    icon: FileText,
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "per month",
    description: "For serious job seekers",
    features: [
      "All 50+ Templates",
      "Advanced Resume Builder",
      "ATS Optimization",
      "PDF & Word Download",
      "Unlimited Resumes",
      "AI Content Suggestions",
      "Priority Support",
    ],
    cta: "Start Free Trial",
    popular: true,
    icon: Star,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For teams and organizations",
    features: [
      "All Pro Features",
      "Team Management",
      "Custom Branding",
      "Dedicated Account Manager",
      "API Access",
      "Custom Integrations",
      "SLA Guarantee",
    ],
    cta: "Contact Sales",
    popular: false,
    icon: Crown,
  },
];

const features = [
  {
    title: "ATS Optimization",
    description: "Pass through Applicant Tracking Systems with ease",
    icon: Zap,
  },
  {
    title: "AI-Powered Suggestions",
    description: "Get intelligent recommendations for your content",
    icon: Star,
  },
  {
    title: "Multiple Formats",
    description: "Export to PDF, Word, and other formats",
    icon: Download,
  },
  {
    title: "Team Collaboration",
    description: "Work together with your career advisor",
    icon: Users,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <DarkVeil
          className="min-h-[calc(60vh-4rem)]"
          hueShift={390}
          noiseIntensity={0.04}
          speed={0.3}
        >
          <section className="min-h-[calc(60vh-4rem)] flex items-center pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center space-y-6 w-full">
              <Badge
                variant="outline"
                className="text-sm font-medium py-1.5 px-4 backdrop-blur-md shadow-lg transition-all duration-300 bg-white/10 border-white/20 text-white hover:bg-white/15 hover:border-white/30 dark:bg-white/10 dark:border-white/20 dark:text-white dark:hover:bg-white/15 dark:hover:border-white/30 mx-auto"
              >
                Simple Pricing
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                Choose the Plan That Fits Your Goals
              </h1>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                From individuals to teams, we have a plan that works for everyone. Start for free and upgrade when you&#39;re ready.
              </p>
            </div>
          </section>
        </DarkVeil>
      </div>

      {/* Pricing Section */}
      <section className="py-20 bg-black -mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <Card 
                  key={index} 
                  className={`bg-card border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 relative flex flex-col ${
                    plan.popular ? "ring-2 ring-purple-500/50 scale-105 lg:scale-110 z-10" : ""
                  }`}
                >
                  {/* Moved the badge to top right corner */}
                  {plan.popular && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full shadow-lg text-sm">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold">{plan.price}</span>
                          {plan.period && (
                            <span className="text-muted-foreground">/{plan.period}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <CardDescription className="pt-2">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6 flex-grow">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="mt-auto">
                    <Button 
                      className={`w-full rounded-full ${
                        plan.popular 
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 dark:bg-white dark:text-white dark:hover:bg-white/90 dark:hover:text-white transition-all duration-300" 
                          : ""
                      }`}
                      asChild
                    >
                      <Link href={plan.name === "Enterprise" ? "/contact" : "/create"}>
                        {plan.cta}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              All plans include these powerful features to help you land your dream job
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="bg-card border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 text-center">
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about our pricing
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger value="item-1">Can I switch plans anytime?</AccordionTrigger>
              <AccordionContent value="item-1">
                Yes, you can upgrade, downgrade, or cancel your subscription at any time. 
                Changes take effect immediately and you&#39;ll only be charged for the time you use.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger value="item-2">Do you offer discounts for students?</AccordionTrigger>
              <AccordionContent value="item-2">
                Yes, we offer a 50% discount for students with a valid .edu email address. 
                Contact our support team to verify your student status and apply the discount.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger value="item-3">Is there a free trial for Pro plans?</AccordionTrigger>
              <AccordionContent value="item-3">
                Yes, we offer a 7-day free trial for Pro plans. No credit card required to start your trial. 
                You&#39;ll have full access to all Pro features during the trial period.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger value="item-4">What payment methods do you accept?</AccordionTrigger>
              <AccordionContent value="item-4">
                We accept all major credit cards including Visa, Mastercard, American Express, and Discover. 
                For Enterprise plans, we also support bank transfers and purchase orders.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-3xl mx-auto text-center space-y-6 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of job seekers who have landed interviews with Resumify resumes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="rounded-full">
              <Link href="/create">Create Your Resume Now</Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-full" asChild>
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Resumify</h3>
              <p className="text-muted-foreground">
                Crafting resumes that get results
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-4">
                  <Link
                    href="/about"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    About
                  </Link>
                  <Link
                    href="/pricing"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/contact"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contact
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {new Date().getFullYear()} Resumify. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Navbar } from "@/components/navbar";
import { DarkVeil } from "@/components/ui/dark-veil";
import {
  FileText,
  Target,
  Lightbulb,
  Award,
  Heart,
  Globe,
  Zap,
} from "lucide-react";

const values = [
  {
    title: "Empowerment",
    description: "We believe everyone deserves a chance to showcase their talents.",
    icon: Heart,
  },
  {
    title: "Innovation",
    description: "Constantly pushing boundaries with cutting-edge technology.",
    icon: Lightbulb,
  },
  {
    title: "Accessibility",
    description: "Making professional resume building available to all.",
    icon: Globe,
  },
  {
    title: "Excellence",
    description: "Committed to delivering the highest quality tools and service.",
    icon: Award,
  },
];

export default function AboutPage() {
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
                Our Story
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                Crafting Careers, One Resume at a Time
              </h1>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                We're on a mission to help job seekers create professional resumes that stand out and get noticed.
              </p>
            </div>
          </section>
        </DarkVeil>
      </div>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                At Resumify, we believe that everyone deserves a chance to showcase their professional journey effectively. 
                Our mission is to democratize access to professional resume-building tools, making it easy for anyone to 
                create a compelling resume that opens doors to new opportunities.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Founded in 2025, we've helped over 10,000 job seekers land interviews and advance their careers. 
                We're constantly innovating to ensure our platform remains at the forefront of resume-building technology.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button asChild className="rounded-full">
                  <Link href="/create">
                    <FileText className="h-4 w-4 mr-2" />
                    Create Your Resume
                  </Link>
                </Button>
                <Button variant="outline" asChild className="rounded-full">
                  <Link href="/templates">
                    View Templates
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-20"></div>
              <Card className="relative bg-card border-0 rounded-2xl overflow-hidden shadow-xl">
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-primary">10K+</div>
                      <div className="text-sm text-muted-foreground">Resumes Created</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-primary">95%</div>
                      <div className="text-sm text-muted-foreground">ATS Pass Rate</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-primary">50+</div>
                      <div className="text-sm text-muted-foreground">Templates</div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-primary">24/7</div>
                      <div className="text-sm text-muted-foreground">Support</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Our Core Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do at Resumify
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="bg-card border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold">
                      {value.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-3xl mx-auto text-center space-y-6 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of job seekers who have landed interviews with Resumify resumes.
          </p>
          <Button size="lg" className="mt-4 rounded-full">
            <Link href="/create">Create Your Resume Now</Link>
          </Button>
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
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { WobbleCard } from "@/components/ui/wobble-card";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { BlurText } from "@/components/ui/blur-text";
import { RotatingBlurText } from "@/components/ui/rotating-blur-text";
import { DarkVeil } from "@/components/ui/dark-veil";
import {
  FileText,
  LayoutTemplate,
  Palette,
  Zap,
  Shield,
  Gift,
} from "lucide-react";

// Add testimonials data
const testimonials = [
  {
    quote: "Resumify helped me land my dream job at Google! The ATS optimization feature really made a difference in getting past the automated screening.",
    name: "Sarah Johnson",
    designation: "Software Engineer at Google",
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
  },
  {
    quote: "I've tried many resume builders, but Resumify stands out with its beautiful templates and intuitive editor. Created my resume in under 30 minutes!",
    name: "Michael Chen",
    designation: "Product Manager at Microsoft",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
  },
  {
    quote: "As a recent graduate, I had no idea where to start with my resume. Resumify's AI suggestions helped me craft compelling descriptions that impressed recruiters.",
    name: "Emma Rodriguez",
    designation: "Marketing Specialist at Amazon",
    src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
  },
  {
    quote: "The template variety is incredible. I was able to find a design that perfectly matched my personal brand and industry requirements.",
    name: "David Kim",
    designation: "UX Designer at Apple",
    src: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
  },
];

// Import the AnimatedTestimonials component
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

const features = [
  {
    title: "Professional Templates",
    description:
      "Choose from a variety of modern and ATS-friendly resume templates.",
    icon: Palette,
    color:
      "bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 hover:from-violet-500 hover:via-purple-500 hover:to-blue-500",
  },
  {
    title: "Easy to Use",
    description:
      "Create a professional resume in minutes with our intuitive editor.",
    icon: Zap,
    color:
      "bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:via-orange-400 hover:to-red-400",
  },
  {
    title: "ATS Optimized",
    description:
      "Pass through Applicant Tracking Systems with our optimized formatting.",
    icon: Shield,
    color:
      "bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400",
  },
  {
    title: "Free to Use",
    description:
      "Create, edit, and download your resume for free, no strings attached.",
    icon: Gift,
    color:
      "bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 hover:from-pink-400 hover:via-rose-400 hover:to-orange-400",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <DarkVeil
          className="min-h-[calc(100vh-8rem)]"
          hueShift={390}
          noiseIntensity={0.04}
          speed={0.3}
        >
          <section className="min-h-[calc(100vh-8rem)] flex items-center pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
              {/* Left side - Text content */}
              <div className="text-center lg:text-left space-y-6">
                <Badge
                  variant="outline"
                  className="text-sm font-medium mt-9 sm:mt-0 py-1.5 px-3 sm:px-4 backdrop-blur-md shadow-lg transition-all duration-300 bg-white/10 border-white/20 text-white hover:bg-white/15 hover:border-white/30 dark:bg-white/10 dark:border-white/20 dark:text-white dark:hover:bg-white/15 dark:hover:border-white/30"
                >
                  🚀 The Future of Resume Building
                </Badge>
                <div>
                  <RotatingBlurText
                    texts={[
                      "Create Your Perfect Resume",
                      "Build Your Dream Career",
                      "Craft Your Professional Story",
                      "Design Your Future Success",
                      "Launch Your Career Journey",
                    ]}
                    className="text-4xl md:text-6xl font-bold tracking-tight block text-white"
                    variant="word"
                    duration={0.8}
                    rotationInterval={4000}
                  />
                  <BlurText
                    text="in Minutes"
                    className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent block"
                    variant="character"
                    duration={0.6}
                    delay={1.5}
                  />
                </div>
                <p className="text-xl text-gray-200 max-w-2xl lg:max-w-none">
                  Stand out from the crowd with a professional resume that gets
                  you noticed by employers and ATS systems.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                  <Button
                    size="default"
                    asChild
                    className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-full sm:size-lg px-4 sm:px-6"
                  >
                    <Link href="/create">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-sm sm:text-base">
                        Create My Resume Now
                      </span>
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="default"
                    asChild
                    className="gap-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm bg-white/5 transition-all duration-300 transform hover:scale-105 rounded-full sm:size-lg px-4 sm:px-6"
                  >
                    <Link href="/templates">
                      <LayoutTemplate className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-sm sm:text-base">
                        View Templates
                      </span>
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Right side - Resume preview card */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-all duration-500 group-hover:duration-300 transform -skew-y-2 group-hover:skew-y-1 group-hover:-skew-x-1"></div>
                  <Card className="relative w-72 sm:w-80 lg:w-96 h-80 sm:h-96 lg:h-[500px] bg-white/95 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500 transform -skew-y-2 hover:scale-105 hover:skew-y-1 hover:-skew-x-1 rounded-2xl overflow-hidden">
                    {/* Browser-like header */}
                    <div className="bg-gray-100 px-4 py-2 border-b flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <div className="flex-1 bg-white rounded px-2 py-1 text-xs text-gray-600 ml-2">
                        resumify.com/create
                      </div>
                    </div>

                    <CardContent className="p-4 h-full bg-gray-50">
                      <div className="space-y-3">
                        {/* Builder interface header */}
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-gray-900">
                            Resume Builder
                          </h3>
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-purple-400 rounded"></div>
                            <div className="w-2 h-2 bg-blue-400 rounded"></div>
                            <div className="w-2 h-2 bg-green-400 rounded"></div>
                          </div>
                        </div>

                        {/* Form fields */}
                        <div className="space-y-2">
                          <div>
                            <div className="text-xs text-gray-600 mb-1">
                              Personal Information
                            </div>
                            <div className="bg-white rounded border p-2 space-y-1">
                              <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                              <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                              <div className="h-2 bg-purple-200 rounded w-2/3"></div>
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-600 mb-1">
                              Work Experience
                            </div>
                            <div className="bg-white rounded border p-2 space-y-1">
                              <div className="h-2 bg-gray-300 rounded w-full"></div>
                              <div className="h-2 bg-gray-300 rounded w-4/5"></div>
                              <div className="h-2 bg-blue-200 rounded w-3/4"></div>
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-600 mb-1">
                              Skills
                            </div>
                            <div className="bg-white rounded border p-2">
                              <div className="flex flex-wrap gap-1">
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                                  React
                                </span>
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                  JS
                                </span>
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                                  +
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Live preview indicator */}
                        <div className="bg-white rounded border p-2 mt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-xs text-gray-600">
                              Live Preview
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="h-1.5 bg-gray-800 rounded w-1/2"></div>
                            <div className="h-1 bg-gray-600 rounded w-1/3"></div>
                            <div className="h-1 bg-gray-400 rounded w-2/3"></div>
                            <div className="h-1 bg-gray-400 rounded w-1/2"></div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 pt-2">
                          <div className="flex-1 bg-purple-600 rounded px-2 py-1">
                            <div className="h-2 bg-purple-300 rounded w-full"></div>
                          </div>
                          <div className="w-8 bg-gray-300 rounded px-2 py-1">
                            <div className="h-2 bg-gray-400 rounded w-full"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        </DarkVeil>
      </div>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-background to-muted/30">
        <div className=" max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-20">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Why Choose Resumify?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Everything you need to create a winning resume that stands out
              from the competition
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const hoverGradients = [
                "group-hover:bg-gradient-to-br group-hover:from-violet-500/10 group-hover:via-purple-500/5 group-hover:to-blue-500/10", // Professional Templates
                "group-hover:bg-gradient-to-br group-hover:from-amber-500/10 group-hover:via-orange-500/5 group-hover:to-red-500/10", // Easy to Use
                "group-hover:bg-gradient-to-br group-hover:from-emerald-500/10 group-hover:via-teal-500/5 group-hover:to-cyan-500/10", // ATS Optimized
                "group-hover:bg-gradient-to-br group-hover:from-pink-500/10 group-hover:via-rose-500/5 group-hover:to-orange-500/10", // Free to Use
              ];

              const shadowColors = [
                "group-hover:shadow-violet-500/20", // Professional Templates
                "group-hover:shadow-orange-500/20", // Easy to Use
                "group-hover:shadow-emerald-500/20", // ATS Optimized
                "group-hover:shadow-pink-500/20", // Free to Use
              ];

              return (
                <Card
                  key={index}
                  className={`group relative overflow-hidden border-0 bg-card/50 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl ${shadowColors[index]} ${hoverGradients[index]}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardHeader className="pb-4 relative z-10">
                    <div className="relative mb-6">
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center ${feature.color} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}
                      >
                        <feature.icon className="w-8 h-8 text-white filter drop-shadow-sm" />
                      </div>
                      <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                    </div>
                    <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-base leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">
                      {feature.description}
                    </CardDescription>
                  </CardContent>

                  {/* Enhanced border glow effect with feature-specific colors */}
                  <div
                    className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${hoverGradients[
                      index
                    ]
                      .replace("bg-gradient", "border-gradient")
                      .replace("/10", "/30")
                      .replace("/5", "/20")}`}
                  />
                </Card>
              );
            })}
          </div>
        </div>
      </section>

     

      {/* Wobble Card Section */}
      <section className="bg-purple-100 dark:bg-purple-950 py-20 px-5 sm:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-screen-xl mx-auto w-full">
          <WobbleCard
            containerClassName="col-span-1 lg:col-span-2 h-full bg-purple-900 min-h-[500px] lg:min-h-[300px]"
            className=""
          >
            <div className="max-w-xs">
              <h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                Create Your Perfect Resume
              </h2>
              <p className="mt-4 text-left text-base/6 text-neutral-200">
                Build a professional resume in minutes with our easy-to-use editor and modern templates.
              </p>
            </div>
            <Image
              src="/create-resume-img.png"
              width={550}
              height={500}
              alt="Resume creation"
              className="absolute -right-4 lg:-right-[40%] grayscale filter -bottom-10 object-contain rounded-2xl"
            />
          </WobbleCard>
          <WobbleCard containerClassName="col-span-1 min-h-[300px] bg-blue-900">
            <h2 className="max-w-80 text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
              ATS Optimized
            </h2>
            <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
              Pass through Applicant Tracking Systems with our optimized formatting.
            </p>
          </WobbleCard>
          <WobbleCard containerClassName="col-span-1 lg:col-span-3 bg-indigo-900 min-h-[500px] lg:min-h-[600px] xl:min-h-[300px]">
            <div className="max-w-sm">
              <h2 className="max-w-sm md:max-w-lg text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                Land Your Dream Job
              </h2>
              <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
                Join thousands of job seekers who have landed interviews with Resumify resumes.
              </p>
            </div>
            <Image
              src="/template-preview-img.png"
              width={500}
              height={500}
              alt="Successful career"
              className="absolute -right-10 md:-right-[40%] lg:-right-[20%] -bottom-10 object-contain rounded-2xl"
            />
          </WobbleCard>
        </div>
      </section>

       {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              What Our Users Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Don&apos;t just take our word for it. Hear from professionals who have transformed their careers with Resumify.
            </p>
          </div>
          <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
        </div>
      </section>
      
  {/* CTA Section */}
      <section className="py-20 bg-purple-950/75">
        <div className="max-w-3xl mx-auto text-center space-y-6 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-xl text-muted dark:text-white/55">
            Create a professional resume in minutes and start applying to your
            dream companies today.
          </p>
          <Button size="lg" className="mt-4">
            <Link href="/create">Get Started for Free</Link>
          </Button>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2">
              <Image
                src="/logo/resumify-logo.png"
                alt="Resumify Logo"
                width={120}
                height={30}
                className="object-contain"
              />
              <p className="text-muted-foreground">
                Crafting resumes that get results
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="hidden md:flex items-center gap-6">
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
          <div className="mt-8 pt-8 border-t-[0.1px] border-t-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {new Date().getFullYear()} Resumify. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

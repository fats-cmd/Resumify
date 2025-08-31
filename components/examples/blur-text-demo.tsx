"use client"

import { BlurText } from "@/components/ui/blur-text"

export function BlurTextDemo() {
  return (
    <div className="space-y-8 p-8">
      {/* Word-by-word blur animation */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Word Animation</h3>
        <BlurText
          text="This text will blur in word by word"
          className="text-2xl font-bold"
          variant="word"
          duration={0.8}
        />
      </div>

      {/* Character-by-character blur animation */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Character Animation</h3>
        <BlurText
          text="Character by character animation"
          className="text-2xl font-bold"
          variant="character"
          duration={0.6}
        />
      </div>

      {/* With custom delay */}
      <div>
        <h3 className="text-lg font-semibold mb-4">With Delay</h3>
        <BlurText
          text="This starts after a delay"
          className="text-2xl font-bold text-purple-600"
          variant="word"
          duration={1}
          delay={1}
        />
      </div>

      {/* Large hero text */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Hero Text</h3>
        <BlurText
          text="Welcome to Resumify"
          className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
          variant="word"
          duration={1.2}
        />
      </div>
    </div>
  )
}
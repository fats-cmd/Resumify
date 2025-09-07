import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
  className?: string
  inputClassName?: string
}

function OtpInput({ 
  value, 
  onChange, 
  length = 6, 
  className,
  inputClassName
}: OtpInputProps) {
  const inputRefs = React.useRef<HTMLInputElement[]>([])
  
  // Ensure we have the correct number of digits
  const otpValue = value.padEnd(length, '').substring(0, length).split('')

  const handleChange = (index: number, inputValue: string) => {
    // Only allow digits
    if (inputValue && !/^\d$/.test(inputValue)) return
    
    const newOtp = [...otpValue]
    newOtp[index] = inputValue
    onChange(newOtp.join('').trim())
    
    // Auto-focus next input if a digit is entered
    if (inputValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace" && !otpValue[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    
    // Handle arrow keys for navigation
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasteData = e.clipboardData.getData("text/plain").replace(/\D/g, "")
    
    if (pasteData.length === length) {
      onChange(pasteData)
      // Focus the last input
      inputRefs.current[length - 1]?.focus()
    }
  }

  return (
    <div className={cn("flex justify-between space-x-3", className)}>
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          ref={(ref) => {
            if (ref) inputRefs.current[index] = ref
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otpValue[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={cn(
            "w-12 h-14 text-center text-2xl font-bold",
            inputClassName
          )}
        />
      ))}
    </div>
  )
}

export { OtpInput }
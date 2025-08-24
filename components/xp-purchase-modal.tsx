"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  CreditCard,
  Wallet,
  Bitcoin,
  Shield,
  Star,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Gift,
  Clock,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface XPPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
}

type Step = "select" | "payment" | "processing" | "success"
type PaymentMethod = "card" | "crypto" | "wallet"

const packages = [
  {
    id: "starter",
    name: "Starter Pack",
    xp: 1000,
    price: 9.99,
    bonus: 0,
    popular: false,
    color: "from-blue-500 to-cyan-400",
    description: "Perfect for beginners",
  },
  {
    id: "popular",
    name: "Popular Choice",
    xp: 5000,
    price: 39.99,
    bonus: 1000,
    popular: true,
    color: "from-purple-500 to-pink-400",
    description: "Most value for money",
  },
  {
    id: "premium",
    name: "Premium Pack",
    xp: 10000,
    price: 69.99,
    bonus: 3000,
    popular: false,
    color: "from-amber-500 to-orange-400",
    description: "For serious learners",
  },
  {
    id: "ultimate",
    name: "Ultimate Pack",
    xp: 25000,
    price: 149.99,
    bonus: 10000,
    popular: false,
    color: "from-emerald-500 to-teal-400",
    description: "Maximum learning power",
  },
]

const paymentMethods = [
  {
    id: "card",
    name: "Credit Card",
    icon: CreditCard,
    description: "Visa, Mastercard, American Express",
    processing: "2-3 minutes",
  },
  {
    id: "crypto",
    name: "Cryptocurrency",
    icon: Bitcoin,
    description: "Bitcoin, Ethereum, ICP",
    processing: "5-10 minutes",
  },
  {
    id: "wallet",
    name: "Digital Wallet",
    icon: Wallet,
    description: "PayPal, Apple Pay, Google Pay",
    processing: "1-2 minutes",
  },
]

export function XPPurchaseModal({ isOpen, onClose }: XPPurchaseModalProps) {
  const [step, setStep] = React.useState<Step>("select")
  const [selectedPackage, setSelectedPackage] = React.useState(packages[1])
  const [selectedPayment, setSelectedPayment] = React.useState<PaymentMethod>("card")
  const [isProcessing, setIsProcessing] = React.useState(false)

  const resetModal = () => {
    setStep("select")
    setSelectedPackage(packages[1])
    setSelectedPayment("card")
    setIsProcessing(false)
  }

  const handleClose = () => {
    resetModal()
    onClose()
  }

  const handlePurchase = async () => {
    setStep("processing")
    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    setStep("success")
    setIsProcessing(false)

    // Auto close after success
    setTimeout(() => {
      handleClose()
    }, 2000)
  }

  const totalXP = selectedPackage.xp + selectedPackage.bonus
  const savings = selectedPackage.bonus > 0 ? ((selectedPackage.bonus / selectedPackage.xp) * 100).toFixed(0) : "0"

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border-purple-500/30 text-white">
        <DialogHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="absolute -top-2 -right-2 text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="size-4" />
          </Button>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {step === "select" && "Choose Your XP Package"}
            {step === "payment" && "Payment Details"}
            {step === "processing" && "Processing Payment"}
            {step === "success" && "Purchase Complete!"}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Package Selection */}
        {step === "select" && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-white/80 mb-6">
                Boost your learning journey with XP packages. Unlock premium features and accelerate your progress!
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={cn(
                    "relative cursor-pointer border-2 transition-all duration-300 hover:scale-105",
                    selectedPackage.id === pkg.id
                      ? "border-purple-400 bg-purple-500/10"
                      : "border-white/20 bg-white/5 hover:border-white/40",
                  )}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1">
                        <Star className="size-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-lg bg-gradient-to-r mb-4 flex items-center justify-center",
                        pkg.color,
                      )}
                    >
                      <Zap className="size-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                    <p className="text-white/60 text-sm mb-4">{pkg.description}</p>

                    <div className="space-y-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">${pkg.price}</span>
                        <span className="text-white/60">USD</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white/80">Base XP</span>
                          <span className="text-white font-semibold">{pkg.xp.toLocaleString()}</span>
                        </div>
                        {pkg.bonus > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-emerald-400">Bonus XP</span>
                            <span className="text-emerald-400 font-semibold">+{pkg.bonus.toLocaleString()}</span>
                          </div>
                        )}
                        <Separator className="bg-white/20" />
                        <div className="flex items-center justify-between">
                          <span className="text-white font-semibold">Total XP</span>
                          <span className="text-white font-bold text-lg">{(pkg.xp + pkg.bonus).toLocaleString()}</span>
                        </div>
                      </div>

                      {pkg.bonus > 0 && (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                          <Gift className="size-3 mr-1" />
                          {savings}% Bonus XP
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Shield className="size-4 text-emerald-400" />
                <span>30-day money-back guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <CheckCircle2 className="size-4 text-blue-400" />
                <span>Instant XP delivery</span>
              </div>
            </div>

            <Button
              onClick={() => setStep("payment")}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 text-lg font-semibold"
            >
              Continue to Payment
              <ArrowRight className="ml-2 size-5" />
            </Button>
          </div>
        )}

        {/* Step 2: Payment Method */}
        {step === "payment" && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Payment Methods */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Select Payment Method</h3>
                {paymentMethods.map((method) => (
                  <Card
                    key={method.id}
                    className={cn(
                      "cursor-pointer border-2 transition-all",
                      selectedPayment === method.id
                        ? "border-purple-400 bg-purple-500/10"
                        : "border-white/20 bg-white/5 hover:border-white/40",
                    )}
                    onClick={() => setSelectedPayment(method.id as PaymentMethod)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <method.icon className="size-6 text-purple-400" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{method.name}</h4>
                          <p className="text-sm text-white/60">{method.description}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="size-3 text-emerald-400" />
                            <span className="text-xs text-emerald-400">{method.processing}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Payment Form */}
                {selectedPayment === "card" && (
                  <div className="space-y-4 mt-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="cardNumber" className="text-white/80">
                          Card Number
                        </Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>
                      <div>
                        <Label htmlFor="expiryDate" className="text-white/80">
                          Expiry Date
                        </Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/YY"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="cvv" className="text-white/80">
                          CVV
                        </Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardName" className="text-white/80">
                          Cardholder Name
                        </Label>
                        <Input
                          id="cardName"
                          placeholder="John Doe"
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
                <Card className="border-white/20 bg-white/5">
                  <CardContent className="p-6">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-lg bg-gradient-to-r mb-4 flex items-center justify-center",
                        selectedPackage.color,
                      )}
                    >
                      <Zap className="size-6 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">{selectedPackage.name}</h4>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">Base XP</span>
                        <span className="text-white">{selectedPackage.xp.toLocaleString()}</span>
                      </div>
                      {selectedPackage.bonus > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-400">Bonus XP</span>
                          <span className="text-emerald-400">+{selectedPackage.bonus.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-white/80">Processing Fee</span>
                        <span className="text-white">$0.00</span>
                      </div>
                      <Separator className="bg-white/20" />
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold">Total XP</span>
                        <span className="text-white font-bold text-lg">{totalXP.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold">Total Price</span>
                        <span className="text-white font-bold text-xl">${selectedPackage.price}</span>
                      </div>
                    </div>

                    <div className="mt-6 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Shield className="size-4 text-emerald-400" />
                        <span>Secure payment processing</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Sparkles className="size-4 text-purple-400" />
                        <span>XP added instantly to your account</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setStep("select")}
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Back to Packages
              </Button>
              <Button
                onClick={handlePurchase}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 font-semibold"
              >
                Complete Purchase - ${selectedPackage.price}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Processing */}
        {step === "processing" && (
          <div className="text-center space-y-6 py-12">
            <div className="relative">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
                <CreditCard className="size-12 text-white animate-bounce" />
              </div>
              <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full border-4 border-purple-400/30 animate-spin border-t-purple-400"></div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Processing Your Payment</h3>
              <p className="text-white/60">Please wait while we securely process your transaction...</p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === "success" && (
          <div className="text-center space-y-6 py-12">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center">
              <CheckCircle2 className="size-12 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Purchase Successful!</h3>
              <p className="text-white/60 mb-4">{totalXP.toLocaleString()} XP has been added to your account</p>
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-2 rounded-full border border-emerald-500/30">
                <Sparkles className="size-4" />
                <span className="font-semibold">+{totalXP.toLocaleString()} XP</span>
              </div>
            </div>
            <p className="text-sm text-white/60">This modal will close automatically in a few seconds...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

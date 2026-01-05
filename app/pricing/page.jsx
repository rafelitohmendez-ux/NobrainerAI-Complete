'use client'

import React, { useState, useEffect } from 'react';
import { Check, HelpCircle , AlertCircle, ArrowRight} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const supabase = createClient('https://tnijqmtoqpmgdhvltuhl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuaWpxbXRvcXBtZ2Rodmx0dWhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjUwOTE3MzcsImV4cCI6MjA0MDY2NzczN30.3c2EqGn5n0jLmG4l2NO_ovN_aIAhaLDBa0EKdwdnhCg')

const PricingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [userCredits, setUserCredits] = useState(0);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { user } = useUser();

  const plans = [
    {
      name: "Free",
      description: "Perfect for trying out NobrainerAI",
      price: "0",
      credits: 20,
      features: [
        "100 AI chat messages/month",
        "5 image generations/month",
        "Basic templates",
        "Community support"
      ],
      buttonText: "Get Started",
      isPopular: false
    },
    {
      name: "Pro",
      description: "For power users and creators",
      price: "19",
      credits: 100,
      features: [
        "Integrate Multiple Chat Models",
        "100 image generations/month",
        "Priority support",
        "Custom templates",
        "API access",
        "Advanced analytics"
      ],
      buttonText: "Pay Now",
      isPopular: true
    },
    {
      name: "Enterprise",
      description: "For teams and businesses",
      price: "99",
      credits: 200,
      features: [
        "Everything in Pro",
        "Multi Image and Video Model",
        "Custom AI model fine-tuning",
        "Dedicated account manager",
        "UGC Video Generator"
      ],
      buttonText: "Pay Now",
      isPopular: false
    }
  ];

  useEffect(() => {
    const checkUserCredits = async () => {
      if (!user) return;

      const { data, error: fetchError } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('userid', user.id)
        .single();

      if (fetchError || !data) {
        // New user - insert 20 credits
        const { error: insertError } = await supabase
          .from('user_credits')
          .insert({
            userid: user.id,
            credits: 20
          });

        if (!insertError) {
          setUserCredits(20);
        }
      } else {
        setUserCredits(data.credits);
      }
    };

    if (user) {
      checkUserCredits();
    }
  }, [user]);

  // Initialize PayPal when component mounts
  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://www.paypal.com/sdk/js?client-id=AQ3hHQbVcAFxIVpKOip-LluE3whXGHLeLpI215fswm7_9ulbeO6vlwMxpN5tE7vdQN8ej44pvFleU91r&currency=USD";
    script.async = true;
    script.onload = () => {
      if (window.paypal && selectedPlan) {
        initializePayPalButton();
      }
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [selectedPlan]);

  const initializePayPalButton = () => {
    if (window.paypal && document.getElementById('paypal-button-container')) {
      window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: selectedPlan.price,
                currency_code: 'USD'
              },
              description: `NobrAI ${selectedPlan.name} Plan`
            }]
          });
        },
        onApprove: async (data, actions) => {
          try {
            await actions.order.capture();
            
            // Update user credits
            if (user && selectedPlan.credits > 0) {
              const { error } = await supabase
                .from('user_credits')
                .update({ credits: userCredits + selectedPlan.credits })
                .eq('userid', user.id);

              if (error) {
                throw error;
              }

              // Update local state
              setUserCredits(prevCredits => prevCredits + selectedPlan.credits);
              
              // Show success alert
              setShowSuccessAlert(true);
              setTimeout(() => setShowSuccessAlert(false), 5000);
            }

            // Close payment dialog
            setPaymentDialogOpen(false);
          } catch (error) {
            console.error('Payment or credits update error:', error);
            setErrorMessage('Error updating credits. Please contact support.');
            setShowErrorAlert(true);
          }
        },
        onError: (err) => {
          console.error('PayPal Error:', err);
          setErrorMessage('There was an error processing your payment. Please try again.');
          setShowErrorAlert(true);
        }
      }).render('#paypal-button-container');
    }
  };

  const handlePlanSelection = (plan) => {
    if (plan.price === "0") {
      // Handle free plan signup
      alert("You've signed up for the free plan!");
      return;
    }
    setSelectedPlan(plan);
    setPaymentDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
    {showSuccessAlert && (
      <Alert className="fixed top-4 right-4 z-50 bg-indigo-900/10 border-indigo-700">
        <Check className="h-4 w-4" />
        <AlertTitle>Credits Added!</AlertTitle>
        <AlertDescription>
          {selectedPlan.credits} credits have been added to your account.
        </AlertDescription>
      </Alert>
    )}

    {showErrorAlert && (
      <Alert variant="destructive" className="fixed top-4 right-4 z-50">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>
    )}

    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <Badge variant="secondary" className="bg-indigo-900/20 text-indigo-400 hover:bg-indigo-800/30 mb-4">
          ✨ Special Launch Pricing
        </Badge>
        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-300 mb-4">
          Simple, transparent pricing
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Choose the perfect plan for your needs. All plans include our core features with different usage limits.
        </p>
        {user && (
          <p className="mt-4 text-gray-300">
            Current Credits: {userCredits}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <Card 
            key={index}
            className={`group relative bg-gray-900 border-2 border-gray-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:border-indigo-700 hover:shadow-2xl ${
              plan.isPopular ? 'border-indigo-700' : ''
            }`}
          >
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  Most Popular
                </Badge>
              </div>
            )}
            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl font-bold text-white">{plan.name}</CardTitle>
              <CardDescription className="text-gray-400">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-gray-400">/month</span>
                {plan.credits > 0 && (
                  <div className="text-sm text-gray-400 mt-2">
                    {plan.credits} credits included
                  </div>
                )}
              </div>
              <Button 
                className={`w-full mb-6 group flex items-center justify-center ${
                  plan.isPopular 
                    ? 'bg-gradient-to-r from-indigo-800 to-purple-900 hover:shadow-xl transition-all transform hover:scale-[1.02]' 
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
                onClick={() => handlePlanSelection(plan)}
              >
                {plan.buttonText}
                <ArrowRight className="ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" size={18} />
              </Button>
              <ul className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2">
                    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-1 rounded-full">
                      <Check className="w-3 h-3 text-indigo-300" />
                    </div>
                    <span className="text-gray-300">{feature}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-gray-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-48 text-sm">Learn more about {feature.toLowerCase()}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </li>
                ))}
              </ul>
            </CardContent>
            <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity z-0"></div>
          </Card>
        ))}
      </div>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Pay for {selectedPlan?.name} Plan</DialogTitle>
            <DialogDescription className="text-gray-400">
              Amount to pay: ${selectedPlan?.price}
              <br />
              Credits to be added: {selectedPlan?.credits}
            </DialogDescription>
          </DialogHeader>
          <div id="paypal-button-container" className="mt-4" />
        </DialogContent>
      </Dialog>

      <div className="mt-16 text-center">
        <p className="text-gray-400 mb-4">All plans include:</p>
        <div className="flex flex-wrap justify-center gap-4">
          {['24/7 Support', 'Regular Updates', '99.9% Uptime', 'SSL Security'].map((feature, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="text-indigo-400 border-indigo-900/50 bg-indigo-950/20 hover:bg-indigo-900/30"
            >
              {feature}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  </div>
  );
};

export default PricingPage;
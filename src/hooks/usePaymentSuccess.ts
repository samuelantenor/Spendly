import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/use-toast';
import { supabase } from '../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

export function usePaymentSuccess() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const sessionId = searchParams.get("session_id");
      
      if (sessionId) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) throw new Error('No user found');

          // Update subscription status
          const { error: updateError } = await supabase
            .from('user_subscriptions')
            .upsert({
              user_id: session.user.id,
              status: 'active',
              updated_at: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
            });

          if (updateError) throw updateError;

          // Refresh subscription data
          await queryClient.invalidateQueries({ queryKey: ['subscription'] });

          toast({
            title: "Thank you for your payment! 🎉",
            description: "Welcome to our shop! You now have full access to all features.",
            type: "success",
            duration: 6000
          });

          // Redirect to home after successful payment
          navigate("/home", { replace: true });
        } catch (error) {
          console.error('Error updating subscription:', error);
          toast({
            type: "error",
            title: "Error",
            description: "Failed to activate your subscription. Please contact support.",
            duration: 5000
          });
          navigate("/subscribe");
        }
      }
    };

    handlePaymentSuccess();
  }, [searchParams, toast, navigate, queryClient]);
} 
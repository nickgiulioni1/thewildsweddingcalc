import { h } from 'preact'; // eslint-disable-line @typescript-eslint/no-unused-vars
import { useState } from 'preact/hooks';
import { CalculationResult } from '../lib/calc';
import { logger } from '../lib/logger';

interface CallToActionProps {
  wildsResult: CalculationResult;
  lauralResult: CalculationResult;
  otherResult: CalculationResult | null;
  guests: number;
  compareMode: boolean;
}

export function CallToAction({
  wildsResult,
  lauralResult,
  otherResult,
  guests,
  compareMode,
}: CallToActionProps) {
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const validateEmail = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const handleEmailSubmit = async (e: Event) => {
    e.preventDefault();
    logger.debug('Email capture form submitted', { email });

    // Validate email
    if (!email.trim()) {
      setEmailError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setEmailError(null);

    try {
      // Generate quote data
      const quoteData = {
        email,
        timestamp: new Date().toISOString(),
        guests,
        compareMode,
        wildsTotal: wildsResult.total,
        lauralTotal: lauralResult.total,
        otherTotal: otherResult?.total || null,
        wildsPerGuest: wildsResult.perGuest,
        lauralPerGuest: lauralResult.perGuest,
        otherPerGuest: otherResult?.perGuest || null,
      };

      logger.info('Quote email request', quoteData);

      // TODO: Integrate with email service API
      // For now, we'll log the data and show success message
      // In production, this would send an email via your backend/email service
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      setSubmitSuccess(true);
      setEmail('');
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);

      logger.info('Quote email sent successfully', { email });
    } catch (error) {
      logger.error('Failed to send quote email', error);
      setEmailError('Failed to send email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div class="cta-section">
      <div class="disclaimer-text">
        <p>Estimates updated for 2025. Pricing based on current data and may vary.</p>
      </div>

      <div class="cta-content">
        <h3>Ready to Learn More?</h3>
        <p class="cta-subtitle">Schedule a tour or get your quote emailed to you.</p>

        <div class="cta-actions">
          <div class="tour-buttons">
            <a
              href="https://thewildsvenue.com/schedule/"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-tour btn-wilds"
              aria-label="Schedule a tour at The Wilds venue"
            >
              Schedule Tour - The Wilds
            </a>
            <a
              href="https://lauralmill.com/schedule-a-tour/"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-tour btn-laural"
              aria-label="Schedule a tour at Laural Mill venue"
            >
              Schedule Tour - Laural Mill
            </a>
          </div>

          <div class="email-capture">
            {submitSuccess ? (
              <div class="email-success">
                <p>✓ Quote sent! Check your email.</p>
              </div>
            ) : (
              <form onSubmit={handleEmailSubmit} class="email-form">
                <input
                  type="email"
                  value={email}
                  onInput={(e) => {
                    setEmail((e.target as HTMLInputElement).value);
                    setEmailError(null);
                  }}
                  placeholder="Email address for quote"
                  class={`email-input ${emailError ? 'input-error' : ''}`}
                  aria-label="Email address"
                  aria-describedby={emailError ? 'email-error' : undefined}
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  class="btn btn-email"
                  disabled={isSubmitting}
                  aria-label="Send quote to email"
                >
                  {isSubmitting ? 'Sending...' : 'Email Quote'}
                </button>
                {emailError && (
                  <div id="email-error" class="email-error" role="alert">
                    {emailError}
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


import type { auth as source } from '../pt-BR/auth.js';

export const auth: typeof source = {
	brand: {
		headlineLine1: 'Your campaigns,',
		headlineLine2: 'at peak performance.',
		description:
			'Track metrics, optimize investments and scale your digital marketing results in one place.',
		chartTitle: 'Campaign performance',
		chartPeriod: 'Last 30 days',
		kpis: {
			roas: { value: '4.8x', delta: '+32%' },
			ctr: { value: '3.9%', delta: '+0.8 p.p.' },
			leads: { value: '12.4k', delta: '+18%' }
		},
		chipCampaign: '"Black Friday" campaign scaled',
		chipRevenue: 'in attributed revenue',
		footer: 'Ads · Social · Email · Analytics — all integrated.'
	},
	recovery: {
		notice: 'These codes will not be shown again. Each code can only be used once.',
		listLabel: 'Recovery codes',
		copied: 'Copied',
		download: 'Download .txt',
		print: 'Print',
		saved: 'I saved my codes in a safe place'
	},
	fields: {
		email: 'Email',
		emailPlaceholder: 'you@company.com',
		password: 'Password',
		newPassword: 'New password',
		confirmNewPassword: 'Confirm new password',
		confirmPassword: 'Confirm password',
		createPasswordPlaceholder: 'Create a password',
		repeatPasswordPlaceholder: 'Repeat your password',
		passwordHint: 'Minimum of {min} characters.',
		strength: 'Strength: {label}'
	},
	validation: {
		emailRequired: 'Enter your email.',
		emailInvalid: 'Invalid email.',
		passwordRequired: 'Enter a password.',
		passwordTooShort: 'Your password must be at least {min} characters long.',
		passwordStrength: {
			veryWeak: 'Very weak',
			weak: 'Weak',
			fair: 'Fair',
			good: 'Good',
			strong: 'Strong'
		}
	},
	errors: {
		network: 'Unable to connect to the server. Check your connection.',
		tooManyAttempts: {
			one: 'Too many attempts. Try again in {count} minute.',
			other: 'Too many attempts. Try again in {count} minutes.'
		},
		invalidCredentials: 'Invalid email or password.',
		tenantAccessDenied: 'You do not have access to this company.',
		loginFailed: 'Unable to sign in. Please try again.',
		userAlreadyExists: 'An account with this email already exists. Try signing in.',
		tenantAlreadyExists:
			'A company with this name already exists. Use another name or ask an administrator for an invitation.',
		registerFailed: 'Unable to create your account. Please try again.',
		resetRequestFailed: 'Unable to request the reset. Please try again.',
		resetTokenInvalid: 'Invalid or expired link.',
		resetFailed: 'Unable to change your password. Please try again.',
		challengeExpired: 'Your verification has expired. Please sign in again.',
		codeInvalid: 'Invalid code. Check it and try again.',
		verifyFailed: 'Unable to complete the verification. Please try again.',
		verifyShortFailed: 'Unable to verify. Please try again.',
		setupFailed: 'Unable to start the setup. Please try again.',
		activateFailed: 'Unable to enable the authenticator app.',
		regenerateFailed: 'Unable to generate new codes. Please try again.'
	},
	login: {
		pageTitle: 'Sign in',
		title: 'Welcome back',
		subtitle: 'Sign in to track your campaigns.',
		registered: 'Account created successfully! Sign in to continue.',
		passwordReset: 'Password changed. Sign in with your new password.',
		sessionExpired: 'Your session has expired. Sign in again to continue.',
		passwordRequired: 'Enter your password.',
		passwordPlaceholder: 'Your password',
		remember: 'Remember me',
		forgot: 'Forgot my password',
		submit: 'Sign in',
		submitting: 'Signing in…',
		noAccount: "Don't have an account yet?",
		createAccount: 'Create a free account'
	},
	register: {
		pageTitle: 'Create account',
		title: 'Create your account',
		subtitle: 'Start scaling your results in just a few minutes.',
		name: 'Full name',
		namePlaceholder: 'What should we call you?',
		nameRequired: 'Enter your name.',
		email: 'Work email',
		company: 'Company or agency (optional)',
		companyPlaceholder: 'Your company name',
		confirmRequired: 'Confirm your password.',
		mismatch: 'Passwords do not match.',
		termsRequired: 'You must accept the terms to continue.',
		termsPrefix: 'I have read and accept the',
		termsLink: 'Terms of Use',
		termsMiddle: 'and the',
		privacyLink: 'Privacy Policy',
		submit: 'Create account',
		submitting: 'Creating account…',
		haveAccount: 'Already have an account?',
		signIn: 'Sign in'
	},
	forgot: {
		pageTitle: 'Forgot my password',
		title: 'Forgot your password?',
		subtitle: 'Enter your email to receive the reset instructions.',
		sent: 'If an account exists with this email, we will send instructions to reset the password.',
		resendIn: 'Resend in {seconds}s',
		resend: 'Resend',
		submit: 'Send link',
		backToLogin: 'Back to sign in'
	},
	reset: {
		pageTitle: 'Reset password',
		title: 'Create a new password',
		invalidTitle: 'Invalid or expired link',
		subtitle: 'Choose a strong password to get back into your account.',
		invalidSubtitle: 'Request a new link to reset your password.',
		invalidAlert: 'This reset link is not valid or has already expired.',
		requestNew: 'Request a new link',
		submit: 'Change password'
	},
	twoFactor: {
		pageTitle: 'Two-step verification',
		title: 'Two-step verification',
		emailSubtitle: 'We sent a code to {hint}. It expires in {countdown}.',
		emailHintFallback: 'your email',
		appSubtitle: 'Enter the code from your authenticator app. Time remaining: {countdown}',
		retryIn: 'Try again in {seconds}s.',
		lowRecovery: {
			one: '{count} recovery code left. Generate new ones in Settings → Security.',
			other: '{count} recovery codes left. Generate new ones in Settings → Security.'
		},
		recoveryLabel: 'Recovery code',
		codeLabel: '6-digit code',
		trustDevice: 'Trust this browser for 30 days',
		verify: 'Verify',
		resendIn: 'Resend code in {seconds}s',
		resend: 'Resend code',
		useApp: 'Use authenticator app code',
		useRecovery: 'Use a recovery code',
		resent: 'We sent a new code to your email.',
		expired: 'Your verification has expired. Please sign in again.'
	}
};

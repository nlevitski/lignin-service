export default ({ env }) => ({
	email: {
		config: {
			provider: "nodemailer",
			providerOptions: {
				host: env("SMTP_HOST"),
				port: 465,
				secure: true,
				// requireTLS: true,
				// ignoreTLS: false,
				auth: {
					user: env("SMTP_USER"),
					pass: env("SMTP_API_KEY"),
				},
			},
			settings: {
				defaultFrom: env("SMTP_FROM_EMAIL"),
				defaultReplyTo: env("SMTP_FROM_EMAIL"),
			},
		},
	},
	telegram: {
		config: {
			provider: "",
		},
	},
	"webp-converter": {
		enabled: true,
		config: {
			mimeTypes: ["image/png", "image/jpeg", "image/jpg"],
		},
	},
	seo: {
		enabled: true,
	},
	upload: {
		config: {
			breakpoints: {
				xlarge: 1920,
				large: 1440,
				medium: 1024,
				small: 768,
				xsmall: 480,
				thumbnail: 240,
			},
		},
	},
});

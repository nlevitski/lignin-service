"use strict";

import { ValidationResult } from "../services/validation";

module.exports = {
	async feedback(ctx) {
		try {
			const formData = ctx.request.body;

			const { errors, errorFields }: ValidationResult =
				await strapi.services["api::form.validation"].validateForm(
					formData,
				);
			if (errorFields.length > 0) {
				ctx.status = 400;
				ctx.body = {
					errors,
					errorFields,
				};
				return;
			}
			const fromEmail = process.env.SMTP_FROM_EMAIL;
			const targetEmail = process.env.SMTP_TARGET_EMAIL;

			// Параллельная отправка email и telegram через Promise.allSettled
			const emailPromise = strapi.plugins["email"].services.email.send({
				to: targetEmail,
				from: fromEmail,
				subject: "Форма обратной связи",
				text: `Имя: ${formData.name}\nТелефон: ${formData.phone}\nEmail: ${formData.email}\nСообщение: ${formData.message}`,
				html: `<p>Имя: ${formData.name}</p><p>Телефон: ${formData.phone}</p><p>Email: ${formData.email}</p><p>Сообщение: ${formData.message}</p>`,
			});

			const telegramPromise =
				strapi.services["api::form.telegram"].sendNotification(
					formData,
				);

			const results = await Promise.allSettled([
				emailPromise,
				telegramPromise,
			]);

			// Проверяем результаты каждой отправки
			let hasEmailError = false;
			let hasTelegramError = false;

			results.forEach((result, index) => {
				if (result.status === "rejected") {
					if (index === 0) {
						console.error("Error sending email: ", result.reason);
						hasEmailError = true;
					} else if (index === 1) {
						console.error(
							"Error sending notification:",
							result.reason,
						);
						hasTelegramError = true;
					}
				}
			});

			// Если обе отправки завершились с ошибкой - возвращаем 424
			if (hasEmailError && hasTelegramError) {
				ctx.status = 424;
				return;
			}

			// Если хотя бы одна отправка успешна - возвращаем успех
			return ctx.send({
				message: `Форма успешно отправлена! ${new Date().toLocaleTimeString("ru-RU")}`,
				data: formData,
			});
		} catch (error) {
			ctx.status = 424;
			return;
		}
	},
};

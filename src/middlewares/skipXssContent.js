import xss from "xss-clean";

export const skipXssForContent = (req, res, next) => {
	// Save the raw content
	if (req.body?.content) {
		req._rawContent = req.body.content;
	}

	// Apply xss-clean middleware
	xss()(req, res, () => {
		// Restore the raw content
		if (req._rawContent) {
			req.body.content = req._rawContent;
		}
		next();
	});
};

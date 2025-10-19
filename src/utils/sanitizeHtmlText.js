import DOMPurify from 'dompurify';
const sanitizeWithDOMPurify = (html) => {
    const config = {
        USE_PROFILES: { html: true }
    };

    return DOMPurify.sanitize(html, config);
};

const sanitizeHtml = (html) => {
    const allowedTags = ['body', 'b', 'br'];
    const allowedAttributes = [];

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const sanitizeNode = (node) => {
        if (
            node.nodeType === Node.ELEMENT_NODE &&
            !allowedTags.includes(node.tagName.toLowerCase())
        ) {
            node.remove();

            return;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
            for (const attr of Array.from(node.attributes)) {
                if (!allowedAttributes.includes(attr.name.toLowerCase())) {
                    node.removeAttribute(attr.name);
                }
            }
        }

        for (const child of Array.from(node.childNodes)) {
            sanitizeNode(child);
        }
    };

    sanitizeNode(doc.body);

    return doc.body.innerHTML;
};

export { sanitizeHtml, sanitizeWithDOMPurify };

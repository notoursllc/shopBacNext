import fs from 'fs';
import path from 'path';
import postmark from 'postmark';
import mjml2html from 'mjml';
import Handlebars from 'handlebars';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const postmarkClient = new postmark.ServerClient(process.env.POSTMARK_API_KEY);


export function sendEmail(config) {
    return postmarkClient.sendEmail({
        From: config.from || process.env.EMAIL_INFO,
        To: config.to,
        Subject: config.subject,
        HtmlBody: config.html,
        TextBody: config.text,
        MessageStream: 'outbound'
    });
}


export function compileMjmlTemplate(file, data) {
    const mjml = fs.readFileSync(path.resolve(__dirname, './templates', file), 'utf8')

    Handlebars.registerHelper('compareStrings', function(p, q, options) {
        return (p == q) ? options.fn(this) : options.inverse(this);
    });

    const template = Handlebars.compile(mjml)
    const { html } = mjml2html(template(data || {}))
    return html;
}

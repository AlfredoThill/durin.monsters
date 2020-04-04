const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

// Entry's comments template
const commentsPath = path.join(__dirname, '..', '..', 'views', 'helpers','entry-comment.hbs');
const comments = fs.readFileSync(commentsPath, 'utf8');
const comments_template = handlebars.compile(comments);

// Just Replies template
const repliesPath = path.join(__dirname, '..', '..', 'views', 'helpers','just-replies.hbs');
const replies = fs.readFileSync(repliesPath, 'utf8');
const replies_template = handlebars.compile(replies);

// Confirmation email template
const mailPath = path.join(__dirname, '..', '..', 'views', 'helpers','confirm-email.hbs');
const mail = fs.readFileSync(mailPath, 'utf8');
const mail_template = handlebars.compile(mail);

// Reset email template
const resetPath = path.join(__dirname, '..', '..', 'views', 'helpers','reset-email.hbs');
const reset = fs.readFileSync(resetPath, 'utf8');
const reset_template = handlebars.compile(reset);

module.exports = {
    comments: comments_template,
    confirmation_mail: mail_template,
    reset_mail: reset_template,
    replies: replies_template,
}
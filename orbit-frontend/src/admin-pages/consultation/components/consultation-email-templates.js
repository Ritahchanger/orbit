export const CONSULTATION_EMAIL_TEMPLATES = [
  {
    id: 'accept',
    name: 'Accept Consultation',
    subject: 'Consultation Accepted - {setupType} on {consultationDate}',
    content: `<div>
  <p>Dear <strong>{customerName}</strong>,</p>
  
  <p>We are pleased to confirm your <strong>{setupType}</strong> consultation has been <strong>ACCEPTED</strong>!</p>
  
  <h3>📅 Appointment Details:</h3>
  <ul>
    <li><strong>Date:</strong> {consultationDate}</li>
    <li><strong>Time:</strong> {consultationTime}</li>
    <li><strong>Duration:</strong> {duration}</li>
    <li><strong>Reference Number:</strong> <code>{referenceNumber}</code></li>
    <li><strong>Status:</strong> ✅ <span style="color: #10b981;">Confirmed</span></li>
  </ul>
  
  <h3>📋 Next Steps:</h3>
  <ol>
    <li>Please arrive 10 minutes before your scheduled time</li>
    <li>Bring any relevant documents or materials</li>
    <li>If you need to reschedule, please contact us at least 24 hours in advance</li>
  </ol>
  
  <h3>📍 Location/Instructions:</h3>
  <p><em>[Add your specific location or online meeting details here]</em></p>
  
  <p>We look forward to assisting you with your {setupType} needs!</p>
  
  <p>Best regards,<br>
  <strong>The Consultation Team</strong><br>
  [Your Company Name]<br>
  [Phone Number]<br>
  [Email Address]</p>
</div>`,
    category: 'accept',
    variables: ['customerName', 'setupType', 'consultationDate', 'consultationTime', 'duration', 'referenceNumber']
  },
  {
    id: 'decline',
    name: 'Decline Consultation',
    subject: 'Regarding your {setupType} consultation request',
    content: `<div>
  <p>Dear <strong>{customerName}</strong>,</p>
  
  <p>Thank you for your interest in our <strong>{setupType}</strong> consultation services.</p>
  
  <p>Unfortunately, we are unable to accommodate your request for <strong>{consultationDate}</strong> at <strong>{consultationTime}</strong> due to <em>[reason - e.g., scheduling conflicts, service unavailability, etc.]</em>.</p>
  
  <h3>📋 Request Details:</h3>
  <ul>
    <li><strong>Reference Number:</strong> <code>{referenceNumber}</code></li>
    <li><strong>Status:</strong> ❌ <span style="color: #ef4444;">Declined</span></li>
  </ul>
  
  <h3>🔄 Alternative Options:</h3>
  <ul>
    <li>We can reschedule to <em>[suggest alternative date/time]</em></li>
    <li>You may consider <em>[alternative service]</em></li>
    <li>Contact us for other available time slots</li>
  </ul>
  
  <p>We appreciate your understanding and hope to serve you in the future.</p>
  
  <p>Best regards,<br>
  <strong>The Consultation Team</strong><br>
  [Your Company Name]<br>
  [Phone Number]<br>
  [Email Address]</p>
</div>`,
    category: 'decline',
    variables: ['customerName', 'setupType', 'consultationDate', 'consultationTime', 'referenceNumber']
  },
  {
    id: 'reschedule',
    name: 'Request Reschedule',
    subject: 'Reschedule Request - {setupType} Consultation',
    content: `<div>
  <p>Dear <strong>{customerName}</strong>,</p>
  
  <p>Regarding your <strong>{setupType}</strong> consultation scheduled for <strong>{consultationDate}</strong> at <strong>{consultationTime}</strong>, we would like to discuss alternative timing.</p>
  
  <h3>📅 Current Appointment:</h3>
  <ul>
    <li><strong>Date:</strong> {consultationDate}</li>
    <li><strong>Time:</strong> {consultationTime}</li>
    <li><strong>Reference:</strong> <code>{referenceNumber}</code></li>
  </ul>
  
  <h3>🕐 Available Alternative Slots:</h3>
  <ol>
    <li><strong>[Alternative Date 1]</strong> at <strong>[Time 1]</strong></li>
    <li><strong>[Alternative Date 2]</strong> at <strong>[Time 2]</strong></li>
    <li><strong>[Alternative Date 3]</strong> at <strong>[Time 3]</strong></li>
  </ol>
  
  <p>Please let us know which slot works best for you, or suggest your preferred time.</p>
  
  <p>We aim to accommodate your schedule while ensuring we provide the best service possible.</p>
  
  <p>Best regards,<br>
  <strong>The Consultation Team</strong><br>
  [Your Company Name]<br>
  [Phone Number]<br>
  [Email Address]</p>
</div>`,
    category: 'reschedule',
    variables: ['customerName', 'setupType', 'consultationDate', 'consultationTime', 'referenceNumber']
  },
  {
    id: 'followup',
    name: 'Follow-up Information',
    subject: 'Additional Information for your {setupType} consultation',
    content: `<div>
  <p>Dear <strong>{customerName}</strong>,</p>
  
  <p>Following up on your <strong>{setupType}</strong> consultation scheduled for <strong>{consultationDate}</strong>, here is some additional information:</p>
  
  <h3>📅 Appointment Details:</h3>
  <table style="border-collapse: collapse; width: 100%;">
    <tr>
      <td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Date:</strong></td>
      <td style="padding: 4px 8px; border: 1px solid #ddd;">{consultationDate}</td>
    </tr>
    <tr>
      <td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Time:</strong></td>
      <td style="padding: 4px 8px; border: 1px solid #ddd;">{consultationTime}</td>
    </tr>
    <tr>
      <td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Duration:</strong></td>
      <td style="padding: 4px 8px; border: 1px solid #ddd;">{duration}</td>
    </tr>
    <tr>
      <td style="padding: 4px 8px; border: 1px solid #ddd;"><strong>Reference:</strong></td>
      <td style="padding: 4px 8px; border: 1px solid #ddd;"><code>{referenceNumber}</code></td>
    </tr>
  </table>
  
  <h3>📋 What to Prepare:</h3>
  <ul>
    <li><em>[Item 1 to prepare]</em></li>
    <li><em>[Item 2 to prepare]</em></li>
    <li><em>[Item 3 to prepare]</em></li>
  </ul>
  
  <h3>💻 Meeting Details:</h3>
  <p><em>[Add meeting link, address, or specific instructions]</em></p>
  
  <p>If you have any questions before your consultation, please don't hesitate to contact us.</p>
  
  <p>Best regards,<br>
  <strong>The Consultation Team</strong><br>
  [Your Company Name]<br>
  [Phone Number]<br>
  [Email Address]</p>
</div>`,
    category: 'info',
    variables: ['customerName', 'setupType', 'consultationDate', 'consultationTime', 'duration', 'referenceNumber']
  },
  {
    id: 'custom',
    name: 'Custom Message',
    subject: '',
    content: '<div><p>Dear <strong>{customerName}</strong>,</p><p><br></p><p><br></p><p>Best regards,<br><strong>The Consultation Team</strong></p></div>',
    category: 'custom',
    variables: []
  }
];

// Helper function to replace template variables in HTML content
export function fillTemplate(template, consultation) {
  let filledSubject = template.subject;
  let filledContent = template.content;
  
  // Replace all variables in subject
  template.variables.forEach(variable => {
    const value = consultation[variable] || '';
    const regex = new RegExp(`{${variable}}`, 'g');
    filledSubject = filledSubject.replace(regex, value);
    filledContent = filledContent.replace(regex, value);
  });
  
  // Also replace any other consultation properties that might be in the template
  Object.keys(consultation).forEach(key => {
    const regex = new RegExp(`{${key}}`, 'g');
    const value = consultation[key] || '';
    filledSubject = filledSubject.replace(regex, value);
    filledContent = filledContent.replace(regex, value);
  });
  
  return {
    subject: filledSubject,
    content: filledContent
  };
}

// Get templates by category
export function getTemplatesByCategory(category) {
  return CONSULTATION_EMAIL_TEMPLATES.filter(template => 
    category === 'all' ? true : template.category === category
  );
}

// Sanitize HTML content for TipTap (remove extra divs if needed)
export function sanitizeForTipTap(htmlContent) {
  // TipTap prefers content without outer div wrapper for better editing
  // Remove the outermost div if it exists
  if (htmlContent.startsWith('<div>') && htmlContent.endsWith('</div>')) {
    return htmlContent.slice(5, -6);
  }
  return htmlContent;
}
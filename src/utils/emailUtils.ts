
import { supabase } from '@/integrations/supabase/client';

export interface EmailVariables {
  agent_name?: string;
  property_address?: string;
  transaction_status?: string;
  task_title?: string;
  task_description?: string;
  priority?: string;
  due_date?: string;
  transaction_url?: string;
  portal_url?: string;
  [key: string]: string | undefined;
}

export const sendTemplateEmail = async (
  templateName: string,
  recipientEmail: string,
  variables: EmailVariables = {},
  recipientName?: string
) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        templateName,
        recipientEmail,
        variables,
        recipientName,
      },
    });

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (agentEmail: string, agentName: string) => {
  return sendTemplateEmail('agent-welcome', agentEmail, {
    agent_name: agentName,
    portal_url: window.location.origin,
  });
};

export const sendTaskCompletedEmail = async (
  agentEmail: string,
  taskTitle: string,
  propertyAddress: string,
  agentName: string,
  transactionId: string
) => {
  return sendTemplateEmail('task-completed', agentEmail, {
    task_title: taskTitle,
    property_address: propertyAddress,
    agent_name: agentName,
    transaction_status: 'Active',
    transaction_url: `${window.location.origin}/transactions/${transactionId}`,
  });
};

export const sendActionRequiredEmail = async (
  agentEmail: string,
  propertyAddress: string,
  taskTitle: string,
  taskDescription: string,
  priority: string,
  dueDate: string,
  transactionId: string
) => {
  return sendTemplateEmail('action-required', agentEmail, {
    property_address: propertyAddress,
    task_title: taskTitle,
    task_description: taskDescription,
    priority: priority,
    due_date: dueDate,
    transaction_url: `${window.location.origin}/transactions/${transactionId}`,
  });
};

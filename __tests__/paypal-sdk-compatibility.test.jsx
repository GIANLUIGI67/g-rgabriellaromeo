import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

// Exercise the installed React SDK rather than mocking it. Only the remotely
// loaded PayPal global is simulated; no payment or network request is made.
test('legacy checkout options and order callbacks work with the patched PayPal SDK', async () => {
  const createOrder = jest.fn().mockResolvedValue('test-order');
  const onApprove = jest.fn().mockResolvedValue(undefined);
  const buttonInstance = {
    isEligible: () => true,
    render: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
  };
  const Buttons = jest.fn(() => buttonInstance);
  const view = render(
    <PayPalScriptProvider options={{
      'client-id': 'test', currency: 'EUR',
      'disable-funding': 'credit,card', components: 'buttons',
    }}>
      <PayPalButtons createOrder={createOrder} onApprove={onApprove}
        style={{ layout: 'vertical', shape: 'rect' }} forceReRender={[15, 'standard']} />
    </PayPalScriptProvider>
  );
  const script = document.querySelector('script[src*="paypal.com/sdk/js"]');
  try {
    expect(script).not.toBeNull();
    const url = new URL(script.src);
    expect(url.searchParams.get('client-id')).toBe('test');
    expect(url.searchParams.get('currency')).toBe('EUR');
    expect(url.searchParams.get('disable-funding')).toBe('credit,card');
    expect(url.searchParams.get('components')).toBe('buttons');

    window.paypal = { Buttons };
    await act(async () => { script.dispatchEvent(new Event('load')); });
    await waitFor(() => expect(buttonInstance.render).toHaveBeenCalledTimes(1));
    const callbacks = Buttons.mock.calls[0][0];
    const actions = { order: { create: jest.fn(), capture: jest.fn() } };
    await expect(callbacks.createOrder({}, actions)).resolves.toBe('test-order');
    expect(createOrder).toHaveBeenCalledWith({}, actions);
    await callbacks.onApprove({ orderID: 'test-order' }, actions);
    expect(onApprove).toHaveBeenCalledWith({ orderID: 'test-order' }, actions);
  } finally {
    view.unmount();
    script?.remove();
    delete window.paypal;
  }
});

# frozen_string_literal: true

module SolidusNexio
  class AlternativePaymentMethod < Spree::PaymentMethod
    include NexioPaymentCommons

    preference(:server, :string, default: 'test')
    preference(:merchant_id, :string, default: nil)
    preference(:auth_token, :string, default: nil)
    preference(:payment_method, :string, default: nil)
    preference(:save_token, :boolean, default: false)
    preference(:customer_redirect, :boolean, default: false)
    preference(:token_domain_presence, :string, default: nil)

    def partial_name
      'nexio_apm'
    end
    alias method_type partial_name

    def generate_token(options)
      order = Spree::Order.find_by(number: options.dig(:order, :number))
      return unless order

      amount = order.respond_to?(:order_total_after_store_credit) ? order.order_total_after_store_credit : order.total
      params = {
        payment_method: preferred_payment_method,
        save_token: preferred_save_token,
        is_auth_only: !auto_capture?
      }.merge!(description_payload(order, options), request_domain_payload(options), options)

      gateway.generate_token(amount.to_money.cents, params)
    end

    def payment_source_class
      ApmSource
    end

    def try_void(payment)
      cancel(payment.response_code)
    end

    private

    def gateway_class
      ActiveMerchant::Billing::NexioApmGateway
    end

    def request_domain_payload(options)
      request_domain = options.delete(:request_domain)
      return {} unless request_domain && preferred_token_domain_presence.present?

      {
        payload: {
          data: {
            preferred_token_domain_presence.to_sym => request_domain
          }
        }
      }
    end

    def description_payload(_order, _options)
      {
        payload: {
          data: {
            description: "eComm #{preferred_payment_method} payment"
          }
        }
      }
    end
  end
end

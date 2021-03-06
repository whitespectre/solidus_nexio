# frozen_string_literal: true

module SolidusNexio
  class BasePaymentController < ::Spree::Api::BaseController
    skip_before_action :authenticate_user

    before_action :payment_method

    private

    def payment_method
      @payment_method ||= ::Spree::PaymentMethod.active.available_to_users.find(params[:payment_method_id])
    end
  end
end

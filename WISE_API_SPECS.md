Quote
The quote resource defines the basic information required for a Wise transfer - the currencies to send between, the amount to send and the profile who is sending the money. The profile must be included when creating a quote.

Quote is one of the required resources to create a transfer, along with the recipient who is to receive the funds.

The quote response contains other information such as the exchange rate, the estimated delivery time and the methods the user can pay for the transfer. Not all of this information may apply to your use case.

Upon creating a quote the current mid-market exchange rate is locked and will be used for the transfer that is created from the quote. The rate will be locked for 30 minutes to give a user time to complete the transfer creation flow.

Endpoints
POST/v3/quotes
POST/v3/profiles/{{profileId}}/quotes
PATCH/v3/profiles/{{profileId}}/quotes/{{quoteId}}
GET/v3/profiles/{{profileId}}/quotes/{{quoteId}}
The Quote resource 
Fields
idtext
ID of this quote (GUID format).

sourceCurrencytext
Source (sending) currency code.

targetCurrencytext
Target (receive) currency code.

sourceAmountdecimal
Amount in source currency to send.

targetAmountdecimal
Amount in target currency to be received by the recipient.

payOuttext
Mechanism we use to deliver the transfer. Not usually of interest to the user.

ratedecimal
Exchange rate value used for the conversion.

createdTimetimestamp
Quote created timestamp.

userinteger
User ID who created the quote.

profileinteger
Personal or business profile ID.

rateTypetext
Whether the rate is "FIXED" or "FLOATING".

rateExpirationTimetimestamp
Time the locked rate will expire.

providedAmountTypetext
Whether the quote was created as "SOURCE" or "TARGET".

pricingConfigurationobject
Allows for pricing configurations to be overridden by partners on a transfer level. Mirrors what was sent in the request.

pricingConfiguration.fee.typetext
Identifies the type of fee that will be configured. Options include only OVERRIDE

pricingConfiguration.fee.variabledecimal
The selected variable percentage (in decimal format) that should be used in the pricingConfiguration

pricingConfiguration.fee.fixeddecimal
The selected fixed fee (in source currency) that should be used in the pricingConfiguration

paymentOptionsarray
List of the methods a user can pay for the transfer. See above for help on choosing the correct one to display.

option.disabledboolean
Whether this option is enabled or not for this quote.

option.estimatedDeliverytimestamp
The estimated delivery time for this combination of payIn and payOut methods, assuming payIn is performed now.

option.formattedEstimatedDeliverytext
A string to display to users for the estimated delivery date.

option.estimatedDeliveryDelaysarray
Array of objects for delivery delays to display to users.

option.estimatedDeliveryDelays.reasontext
Reason of the delivery delay.

option.feeobject
Object containing fee information.

option.fee.transferwisedecimal
The fee to be paid by the sender based on the current state of the quote.

option.fee.payIndecimal
The fee for this payment option, based on the product type of the payment option.

option.fee.discountdecimal
Any discounts that have been applied to this quote for the user.

option.fee.partnerdecimal
If you have agreed a custom price, it will be displayed here.

option.fee.totaldecimal
The total fees to be paid - use this figure when displaying fees on your app.

option.priceobject
Object containing the price information.

option.price.priceSetIdinteger
ID if the price structure.

option.price.totalobject
The total fees to be paid - use this figure when displaying fees on your app.

option.price.total.idinteger
ID of this structure.

option.price.total.typetext
Type of the pricing element - "TOTAL" in this case.

option.price.total.labeltext
Short text describing the price structure this field is nested in.

option.price.total.valueobject
Object containing value elements.

option.price.total.value.amountdecimal
Amount to be paid.

option.price.total.value.currencytext
Currency of the amount to be paid.

option.price.total.value.labeltext
Text version of the price.

option.price.total.explanationobject
Object element giving more details about the price.

option.price.itemslist
Object containing the details of the different elements of the total price.

option.price.items[n].idinteger
ID of this item.

option.price.items[n].typetext
Type of the pricing item. It could be "DISCOUNT" for example.

option.price.items[n].labeltext
Short text describing the pricing element.

option.price.items[n].valuevalue
Object containing value elements.

option.price.items[n].value.amountdecimal
Amount associated to this pricing element. Can be negative for discounts.

option.price.items[n].value.currencytext
Currency on the pricing element.

option.price.items[n].value.labeltext
Text field containing the price and its currency.

option.price.items[n].explanation.plainTexttext
Text element giving more details about the item.

option.price.deferredFee.amountdecimal
The amount of fees that has been deferred by a priceConfiguration override.

option.price.deferredFee.currencytext
The currency of the amount of fees that has been deferred by a priceConfiguration override.

option.price.calculatedOn.unroundedAmountToConverttext
This is the amount, unrounded, that fees were calculated on and built up from.

option.sourceAmountdecimal
sourceAmount when using this payment option.

option.targetAmountdecimal
targetAmount when using this payment option.

option.payIntext
Type of pay in method for this payment option.

option.payOuttext
Type of pay out method for this payment option.

option.allowedProfileTypesarray
Array of the allowed types of profile to use this payment option for this quote "PERSONAL", "BUSINESS" or both.

option.disabledReasonobject
Object present if a payment option is disabled.

option.disabledReason.codetext
Code to denote the reason a payment method is unavailable.

option.disabledReason.messagetext
User friendly message to display when a method is unavailable.

statustext
Current status of this quote, one of: "PENDING", "ACCEPTED", "FUNDED" or "EXPIRED".

expirationTimetimestamp
The time the quote expires.

noticesarray
Array of messages to display to the user in case of useful information based on their selections. May be empty ([]) if there are no messages.

notice.texttext
The message to display.

notice.linktext
URL that provides more information to the message. May be null if there's no URL.

notice.typetext
Type of message, WARNING or INFO or BLOCKED. If it is BLOCKED, don't allow the quote to be used to create the transfer.

Quote Object

{
  "id": "11144c35-9fe8-4c32-b7fd-d05c2a7734bf",
  "sourceCurrency": "GBP",
  "targetCurrency": "USD",
  "sourceAmount": 100,
  "payOut": "BANK_TRANSFER",
  "preferredPayIn": "BANK_TRANSFER",
  "rate": 1.30445,
  "createdTime": "2019-04-05T13:18:58Z",
  "user": 55,
  "profile": 101,
  "rateType": "FIXED",
  "rateExpirationTime": "2019-04-08T13:18:57Z",
  "guaranteedTargetAmountAllowed": true,
  "targetAmountAllowed": true,
  "guaranteedTargetAmount": false,
  "providedAmountType": "SOURCE",
  "pricingConfiguration": {
    "fee": {
      "type": "OVERRIDE",
      "variable": 0.011,
      "fixed": 15.42
    }
  },
  "paymentOptions": [
    {
      "disabled": false,
      "estimatedDelivery": "2019-04-08T12:30:00Z",
      "formattedEstimatedDelivery": "by Apr 8",
      "estimatedDeliveryDelays": [
        {
          "reason": "sample reason"
        }
      ],
      "fee": {
        "transferwise": 3.04,
        "payIn": 0,
        "discount": 2.27,
        "partner": 0,
        "total": 0.77
      },
      "price": {
        "priceSetId": 238,
        "total": {
          "type": "TOTAL",
          "label": "Total fees",
          "value": {
            "amount": 0.77,
            "currency": "GBP",
            "label:": "0.77 GBP"
          }
        },
        "items": [
          {
            "type": "FEE",
            "label": "fee",
            "value": {
              "amount": 0,
              "currency": "GBP",
              "label": "0 GBP"
            }
          },
          {
            "type": "TRANSFERWISE",
            "label": "Our fee",
            "value": {
              "amount": 3.04,
              "currency": "GBP",
              "label": "3.04 GBP"
            }
          },
          {
            "id": 123,
            "type": "DISCOUNT",
            "value": {
              "amount": -2.27,
              "currency": "GBP",
              "label": "2.27 GBP"
            },
            "label": "Discount applied",
            "explanation": {
              "plainText": "You can have a discount for a number of reasons..."
            }
          }
        ],
        "deferredFee": {
          "amount": 14.79,
          "currency": "BRL"
        },
        "calculatedOn": {
          "unroundedAmountToConvert": {
            "amount": 179.97342,
            "currency": "BRL"
          }
        }
      },
      "sourceAmount": 100,
      "targetAmount": 129.24,
      "sourceCurrency": "GBP",
      "targetCurrency": "USD",
      "payIn": "BANK_TRANSFER",
      "payOut": "BANK_TRANSFER",
      "allowedProfileTypes": [
        "PERSONAL",
        "BUSINESS"
      ],
      "payInProduct": "CHEAP",
      "feePercentage": 0.0092
    },
    ...
  ],
  "status": "PENDING",
  "expirationTime": "2019-04-05T13:48:58Z",
  "notices": [
    {
      "text": "You can have a maximum of 3 open transfers with a guaranteed rate. After that, they'll be transferred using the live rate. Complete or cancel your other transfers to regain the use of guaranteed rate.",
      "link": null,
      "type": "WARNING"
    }
  ]
}
Create an un-authenticated quote 
POST /v3/quotes

Use this endpoint to get example quotes for people to see the exchange rate and fees Wise offers before a user has created or linked an account. This can drive a version of the quote screen that shows the user what Wise offers before they sign up. Note that this endpoint does not require a token to create the resource, however, since it is just an example, the returned quote has no ID so can't be used later to create a transfer.

In order to get an accurate partner fee, we require a client credentials token to be provided. If you are a partner and would like your fee to be included in the quote returned, you must provide your auth token. If not, you do not require the Authorization header.

Unauthenticated quotes cannot be used to create transfers, they are meant for illustration purposes in partner interfaces only. Make sure to create an authenticated quote during the transfer creation flow.
Request Fields
sourceCurrencytext
Source (sending) currency code

targetCurrencytext
Target (receiving) currency code

sourceAmountdecimal
Amount in source currency.
Either sourceAmount or targetAmount is required, never both.

targetAmountdecimal
Amount in target currency

pricingConfigurationobject
Required when configured for your client ID. includes a pricingConfiguration to be used for pricing calculations with the quote.

pricingConfiguration.fee.typetext
Identifies the type of fee that will be configured. Options include only OVERRIDE

pricingConfiguration.fee.variabledecimal
The selected variable percentage (in decimal format) that should be used in the pricingConfiguration

pricingConfiguration.fee.fixeddecimal
The selected fixed fee that should be used in the pricingConfiguration. Always considered in source currency.

Response
Returns a quote object.

Example Request

curl -X POST https://api.sandbox.transferwise.tech/v3/quotes/ \
     -H 'Authorization: Bearer <client credential token>' \
     -H 'Content-type: application/json' \
     -d '{
            "sourceCurrency": "GBP",
            "targetCurrency": "USD",
            "sourceAmount": null,
            "targetAmount": 110,
            "pricingConfiguration": {
              "fee": {
                "type": "OVERRIDE",
                "variable": 0.011,
                "fixed": 15.42
              }
            }
         }'
Create an authenticated quote 
POST /v3/profiles/{{profileId}}/quotes

You must use a user access token to authenticate this call and supply the profile with which the quote should be associated. This ensures that quote can be used to create a transfer.
Request Fields
profileIdinteger
Personal or business profile ID of the sender - required.

sourceCurrencytext
Source (sending) currency code.

targetCurrencytext
Target (receiving) currency code.

targetAmountdecimal
Amount in target currency.

sourceAmountdecimal
Amount in source currency.
Either sourceAmount or targetAmount is required, never both.

targetAccountinteger
Optional. This is the ID of transfer recipient, found in response from POST v1/accounts (recipient creation). If provided can be used as an alternative to updating the quote.

payOuttext
Optional. Preferred payout method. Default value is BANK_TRANSFER. Other possible values are BALANCE, SWIFT, SWIFT_OUR and INTERAC.

preferredPayIntext
Optional. Preferred payin method. Use BANK_TRANSFER to return this method at the top of the response's results.

paymentMetadataobject
Optional. Used to pass additional metadata about the intended transfer.

paymentMetadata.transferNaturestring
Optional. Used to pass transfer nature for calculating proper tax amounts (IOF) for transfers to and from BRL. Accepted values are shown dynamically in transfer requirements.

pricingConfigurationobject
Required when configured for your client ID. includes a pricingConfiguration to be used for pricing calculations with the quote.

pricingConfiguration.fee.typetext
Identifies the type of fee that will be configured. Options include only OVERRIDE

pricingConfiguration.fee.variabledecimal
The selected variable percentage (in decimal format) that should be used in the pricingConfiguration

pricingConfiguration.fee.fixeddecimal
The selected fixed fee that should be used in the pricingConfiguration. Always considered in source currency.

If you are funding the transfer from a Multi Currency Balance, you must set the payIn as BALANCE to get the correct pricing in the quote. Not doing so will default to BANK_TRANSFER and the fees will be inconsistent between quote and transfer.

When SWIFT_OUR is set as payOut value, it enables payment protection for swift recipients for global currency transfers. By using this payOut method, you can guarantee your customers that the fee will be charged to the sender and can ensure that the recipient gets the complete target amount.
Response
The following describes the fields of the quote response that may be useful when building your integration.

The payOut field is used to select the correct entry in the paymentOptions array in order to know which fees to display to your customer. Find the paymentOption that matches the payOut field shown at the top level of the quote resource and payIn based on the settlement model the bank is using. By default, this is BANK_TRANSFER, unless you are using a prefunded or bulk settlement model. The payOut field will change based on the type of recipient you add to the quote in the PATCH /quote call, for example to-USD swift_code or to-CAD interac have different fees.

For example sending USD to a country other than the United States is supported but with different fees to domestic USD transfers. Please see the later section on Global Currencies to learn more about how to offer this useful feature.

For each paymentOption there is a price field. It gives a full breakdown of all the taxes, fees and discounts. It is preferable to refer to this structure to show breakdowns and totals, rather than the fee structure, found as well in each paymentOption element, that only gives a summary and is not able to surface important specifics such as taxes.

When showing the price of a transfer always show the 'price.total.value.amount' of a payment option.

Disabled Payment Options
Each payment option is either enabled or disabled based on the disabled value. Disabled payment options should be shown to the user in a disabled state in most cases. This ensures users are given the options that they are familiar with regardless of their availability, as well as with options that can be beneficial to their accounts.

The option.disabledReason contains both the code and message, with the message being the user-friendly text to surface to the user if necessary.

Transfer Nature for BRL
When creating or updating a quote, the transfer nature can be set. This is a requirement for transfers to or from BRL and impacts the fees we charge on the quote, specifically the IOF.

Note that IOF is determined based on the transfer nature, sender information, and recipient information. The default IOF will be included in a quote until all relevant information has been included.

Omitting transfer nature will not prevent the transfer from being created or even funded. However, when attempting to process the transfer, it will be blocked and the money will be refunded to the sender.
Pricing Configuration
When creating or updating a quote, partners that have flexible partner pricing enabled are able to override the pricing configuration dynamically.

To learn more on how to use this feature, please see the Flexible Partner Pricing Guide

Example Request

curl -X POST https://api.sandbox.transferwise.tech/v3/profiles/{{profileId}}/quotes \
     -H 'Authorization: Bearer <your api token>' \
     -H 'Content-Type: application/json' \
     -d '{
              "sourceCurrency": "GBP",
              "targetCurrency": "USD",
              "sourceAmount": 100,
              "targetAmount": null,
              "payOut": null,
              "preferredPayIn": null,
              "targetAccount": 12345,
              "paymentMetadata": {
                  "transferNature": "MOVING_MONEY_BETWEEN_OWN_ACCOUNTS"
              },
              "pricingConfiguration": {
                   "fee": {
                         "type": "OVERRIDE",
                         "variable": 0.011,
                         "fixed": 15.42
                   }
             }
        }'
Update a quote 
PATCH /v3/profiles/{{profileId}}/quotes/{{quoteId}}

You should update a quote using a PATCH call to add a recipient. This will update the saved quote's data based on who and where the money will be sent to.

Updating the quote with a recipient may cause the available payment options, prices and estimated delivery times to change from the original quoted amounts. This is due to the fact that sending some currencies to some destinations costs a different amount based on the payment networks we use, for example sending USD to a country outside the USA uses international rather than domestic payment networks and as such costs more, or sending CAD over the Interac network is a more expensive operation.

When updating a quote the payOut field may change to denote the payment option you should select when sending to this recipient. For example sending USD to a swift_code recipient or CAD to an interac recipient with change payOut to SWIFT or INTERAC respectively. This field defaults to BANK_TRANSFER so it can be used in all cases to help select the correct paymentOption and hence show the correct pricing to users.

If you want to provide more transparency in terms of fees charged when your customers create quote with swift recipient for global currencies, you might consider to set payOut field with SWIFT_OUR value. This will ensure that the recipient receives complete target amount.

In this case, where pricing changes after a user selects recipient, you should show a message to your customer before confirming the transfer. Please see the section on Global Currencies to learn more how and why this works and the messaging you need to display.

Request
targetAccountinteger
ID of transfer recipient, found in response from POST v1/accounts (recipient creation)

payOuttext
Optional. Preferred payout method. Default value is BANK_TRANSFER. Other possible values are BALANCE, SWIFT, SWIFT_OUR and INTERAC.

paymentMetadataobject
Optional. Used to pass additional metadata about the intended transfer.

paymentMetadata.transferNaturestring
Optional. Used to pass transfer nature for calculating proper tax amounts (IOF) for transfers to and from BRL. Accepted values are shown dynamically in transfer requirements.

pricingConfigurationobject
Required when configured for your client ID. Includes a pricingConfiguration to be used for pricing calculations with the quote. If previously passed, the existing pricingConfiguration will remain and not be updated.

pricingConfiguration.fee.typetext
Identifies the type of fee that will be configured. Options include only OVERRIDE

pricingConfiguration.fee.variabledecimal
The selected variable percentage (in decimal format) that should be used in the pricingConfiguration

pricingConfiguration.fee.fixeddecimal
The selected fixed fee (in source currency) that should be used in the pricingConfiguration

Transfer Nature for BRL
When creating or updating a quote, the transfer nature can be set. This is a requirement for transfers to or from BRL and impacts the fees we charge on the quote, specifically the IOF.

Note that IOF is determined based on the transfer nature, sender information, and recipient information. The default IOF will be included in a quote until all relevant information has been included.

Omitting transfer nature will not prevent the transfer from being created or even funded. However, when attempting to process the transfer, it will be blocked and the money will be refunded to the sender.
Example Request

curl -X PATCH https://api.sandbox.transferwise.tech/v3/profiles/{{profileId}}/quotes/{{quoteId}} \
     -H 'Authorization: Bearer <your api token>' \
     -H 'Content-Type: application/merge-patch+json' \
     -d '{
            "targetAccount": 12345,
            "payOut": "SWIFT_OUR",
            "paymentMetadata": {
               "transferNature": "MOVING_MONEY_BETWEEN_OWN_ACCOUNTS"
            },
            "pricingConfiguration": {
              "fee": {
                "type": "OVERRIDE",
                "variable": 0.011,
                "fixed": 15.42
              }
            }
        }'
Retrieve a quote by ID 
GET /v3/profiles/{{profileId}}/quotes/{{quoteId}}

Get quote info by ID. If the quote has expired (not used to create a transfer within 30 minutes of quote creation), it will only be accessible for approximately 48 hours via this endpoint.

Response
Returns a quote object.

Example Request

curl -X GET https://api.sandbox.transferwise.tech/v3/profiles/{{profileId}}/quotes/{{quoteId}} \
     -H 'Authorization: Bearer <your api token>'
Guides
API Reference
Changelog
Support
Search
Wise Platform © 2025

Recipient Account
Recipient or beneficiary is the one who will receive the funds.

Recipient account endpoints use a mixture of our v1 and v2 APIs. Please ensure you address the right version to get the expected results.

All recipient IDs are cross compatible with v1 and v2.
Endpoints
POST/v1/accounts
POST/v1/accounts?refund=true
GET/v2/accounts
GET/v2/accounts/{{accountId}}
DELETE/v2/accounts/{{accountId}}
GET/v1/quotes/{{quoteId}}/account-requirements
The Recipient Account resource

v2
The v2 resource provides useful features such as the accountSummary and longAccountSummary field which can be used to represent the recipient's details in your UI. displayFields array allows you to build an UI containing all the dynamic fields of a recipient individually.

Additionally, the resource also includes a hash of a recipient, which can be used to track recipient details changes. This is a security feature to allow you to re-run any checks your system does on the recipient to validate them against, for example, fraud engines. The hash will remain constant unless the recipient's name or information in the details object changes.

Fields
idinteger
ID of the recipient

creatorIdinteger
Account entity that owns the recipient account

profileIdinteger
Specific profile that owns the recipient account

nameobject
Recipient name details

name.fullNametext
Recipient full name

name.givenNametext
Recipient first name

name.familyNametext
Recipient surname

name.middleNametext
Recipient middle name

currencytext
3 character currency code

countrytext
2 character country code

typetext
Recipient type

legalEntityTypetext
Entity type of recipient

statusboolean
Status of the recipient

detailstext
Account details

details.referencetext
Recipient reference (GBP example)

details.sortCodetext
Recipient bank sort code (GBP example)

details.accountNumbertext
Recipient bank account no (GBP example)

details.hashedByLooseHashAlgorithmtext
Recipient account hash

commonFieldMapobject
Map of key lookup fields on the account

commonFieldMap.bankCodeFieldtext
Bank sort code identifier field

hashtext
Account hash for change tracking

accountSummarytext
Summary of account details for ease of lookup

accountSummarytext
Summary of account details for ease of lookup

longAccountSummarytext
Account details summary

displayFieldsobject
Lookup fields

displayFields.keyobject
Account identifier key name

displayFields.labelobject
Account identifier display label

displayFields.valueobject
Account identifier value

ownedByCustomerboolean
If recipient account belongs to profile owner

Recipient Account Object

{
  "id": 40000000,
  "creatorId": 41000000,
  "profileId": 30000000,
  "name": {
    "fullName": "John Doe",
    "givenName": null,
    "familyName": null,
    "middleName": null,
    "patronymicName": null,
    "cannotHavePatronymicName": null
  },
  "currency": "GBP",
  "country": "GB",
  "type": "SortCode",
  "legalEntityType": "PERSON",
  "active": true,
  "details": {
    "reference": null,
    "accountNumber": "37778842",
    "sortCode": "040075",
    "hashedByLooseHashAlgorithm": "ad245621b974efa3ef870895c3wer419a3f01af18a8a5790b47645dba6304194"
  },
  "commonFieldMap": {
    "accountNumberField": "accountNumber",
    "bankCodeField": "sortCode"
  },
  "hash": "666ef880f8aa6113fa112ba6531d3ed2c26dd9fgbd7de5136bfb827a6e800479",
  "accountSummary": "(04-00-75) 37778842",
  "longAccountSummary": "GBP account ending in 8842",
  "displayFields": [
    {
      "key": "details/sortCode",
      "label": "UK sort code",
      "value": "04-00-75"
    },
    {
      "key": "details/accountNumber",
      "label": "Account number",
      "value": "37778842"
    }
  ],
  "isInternal": false,
  "ownedByCustomer": false
}
Create a recipient account 
A recipient is a person or institution who is the ultimate beneficiary of your payment.

Recipient data includes three data blocks:

General data - the personal details of an individual and basic information about a business.
Bank details - account numbers, routing numbers, and other region-specific bank details.
Address details - country and street address of an individual or business.
General Data
Recipient full name
Legal type (private/business)
Currency
Date of Birth
Owned by customer
Date of Birth is optional. Its usually not required, but consult with the /account-requirements APIs to confirm if it is needed, or contact Wise Support.

Owned by customer is an optional boolean to flag to record whether this recipient is the same entity (person or business) as the one sending the funds. i.e. A user sending money to their own bank account in another country/currency. This field can be used to separate these recipients in your UI, however we do not recommend this as it adds unnecessary complexity to the solution. It is safe to ignore this field and display recipients with both true and false values.

Bank account data
There are many different variations of bank account details needed depending on recipient target currency. For example:

GBP — sort code and account number
BGN, CHF, DKK, EUR, GEL, GBP, NOK, PKR, PLN, RON, SEK — IBAN
USD — routing number, account number, account type
INR — IFSC code, account number
etc.
Address data
Recipient address data is required only if target currency is USD, PHP, THB or TRY, or if the source currency is USD or AUD.

Country
State (US, Canada, Brazil)
City
Address line
Zip code
When creating recipient, the following general rules should be applied to the accountHolderName field:

Full names for personal recipients. They must include more than one name, and both first and last name must have more than one character. Numbers are not allowed in personal recipient names.
Business names must be in full, but can be just a single name. The full name cannot be just a single character but can be made up of a set of single characters. e.g. "A" is not permitted but "A 1" or "A1" is permitted.
Special characters _()'*,. are allowed for personal and business names.
In general the following regex describes our permitted characters for a name: [0-9A-Za-zÀ-ÖØ-öø-ÿ-_()'*,.\s].
Recipient requirements will vary depending on recipient type. A GBP example is provided here.
As you can see many of the fields are null, in order to know which fields are required for which currency we expose the Recipients Requirements endpoint.

Request
POST /v1/accounts

currencytext
3 character currency code

typetext
Recipient type

profileinteger
Personal or business profile ID. It is highly advised to pass the business profile ID in this field if your business account is managed by multiple users, so that the recipient can be accessed by all users authorized on the business account.

accountHolderNametext
Recipient full name

ownedByCustomerboolean
Whether this account is owned by the sending user

detailsobject
Currency specific fields

details.legalTypetext
Recipient legal type: PRIVATE or BUSINESS

details.sortCodetext
Recipient bank sort code (GBP example)

details.accountNumbertext
Recipient bank account no (GBP example)

details.dateOfBirthtext
Optional. Recipient Date of Birth in ISO 8601 date format.

Response
A complete Recipient object is returned when created.

Example Request - GBP Recipient

curl -X POST https://api.sandbox.transferwise.tech/v1/accounts \
     -H 'Authorization: Bearer <your api token>' \
     -H 'Content-Type: application/json' \
     -d '{
          "currency": "GBP",
          "type": "sort_code",
          "profile": 30000000,
          "ownedByCustomer": true,
          "accountHolderName": "John Doe",
           "details": {
              "legalType": "PRIVATE",
              "sortCode": "040075",
              "accountNumber": "37778842",
              "dateOfBirth": "1961-01-01"
           }
         }'
Create a refund recipient account 
POST /v1/accounts?refund=true

Sometimes we may need to refund the transfer back to the sender - see the transfer status here for cases when this may happen.

A refund recipient is a person or institution where we will refund transfer the money back to if necessary. This is not always a mandatory resource to create. If the funds are sent over a fast local payment network we can usually infer the refund recipient from the bank transaction that funded the transfer. Please discuss this with your Wise implementation team if you are unsure if the refund recipient is needed.

If funds are sent using a slow domestic payment network, or you are using a bulk settlement model, we may require you to share the bank details of the source bank account.

Response
A complete Recipient object is returned when created.

The refund recipient account ID returned here is used as sourceAccount when creating transfers.

The format of the request payload for refund recipient creation will be different depending on the currency you will send transfers from. This example is for GBP only. We can provide the correct format for your region upon request. You may use the Account-Requirements API to understand the payload requirements when creating the refund recipient for a specific currency.

Example Request - GBP Refund Recipient

curl -X POST https://api.sandbox.transferwise.tech/v1/accounts?refund=true \
     -H 'Authorization: Bearer <your api token>' \
     -H 'Content-Type: application/json' \
     -d '{
            "currency": "GBP",
            "type": "sort_code",
            "profile": 30000000,
            "details": {  
                "accountHolderName": "John Doe",      
                "legalType": "PRIVATE", 
                "sortCode": "04-00-75",
                "accountNumber": "37778842"
            }
         }'
Create an email recipient account 
POST /v1/accounts

Please contact us before attempting to use email recipients. We do not recommend using this feature except for certain uses cases.
If you don't know recipient bank account details you can set up an email recipient; Wise will collect bank details directly from the recipient.

Wise will email your recipient with a link to collect their bank account details securely. After the bank account details have been provided Wise will complete your transfer.

Its best to confirm that this recipient type is available to your transaction by checking if the "type": "email" class is present in the response from GET /v1/quotes/{{quoteId}}/account-requirements see account requirements for more information on how to use this endpoint.

If planning to send multiple currencies to a single recipient, you will need to create a separate email recipient resource for this beneficiary, for every currency you intend to send to them. We highly encourage you to provide the {profileId} if your recipient is receiving a payment from your Business account, especially if you have multiple businesses, or have multiple users administrating your business account.

Please be aware of the following caveats:

Testing of transfers to email recipients in sandbox is not currently possible.
Recipients will be required to enter bank details every time a payment is made.
We highly encourage you to provide the profileId if your recipient is receiving a payment from your Business account, especially if you have multiple businesses, or have multiple users administrating your business account.
Please refer to our help page on how this works and any additional constraints not mentioned in this section.
Response
A complete Recipient object is returned when created.

Example Request - EUR Email Recipient

curl -X POST https://api.sandbox.transferwise.tech/v1/accounts \
     -H 'Authorization: Bearer <your api token>' \
     -H 'Content-Type: application/json' \
     -d '{ 
          "profile": 30000000, 
          "accountHolderName": "John Doe",
          "currency": "EUR", 
          "type": "email", 
           "details": { 
              "email": "john.doe@transfer-world.com"
           } 
         }'
List recipient accounts

v2
GET /v2/accounts?profileId={{profileId}}&currency={{currency}}

Fetch a list of the user's recipient accounts. Use the profileId parameter to filter by the profile who created the accounts, you should do this based on the personal or business profile ID you have linked to, based on your use case. Other filters are listed below for your convenience, for example currency is a useful filter to use when presenting the user a list of recipients to chose from in the case they have already submitted the target currency of their in your flow.

Pagination
Pagination is supported for this endpoint. The response includes the seekPositionForNext and size parameters to manage this.

It works by setting size and seekPosition parameters in the call. Set the value in the seekPositionForNext of the previous response into the seekPosition parameter of your subsequent call in order to get the next page. To get the current page again, use the seekPositionForCurrent value.

Sorting
You can also set the sort parameter to control the sorting of the response, for example:

?sort=id,asc sort by id ascending.
?sort=id,desc sort by id descending.
?sort=currency,asc sort by currency ascending.

All query parameters are optional.

Query Parameters
creatorIdinteger
Creator of the account.

profileIdinteger
Filter by personal or business profile, returns only those owned by this profile. Defaults to the personal profile.

currencytext
Filter responses by currency, comma separated values are supported (e.g. USD,GBP).

activeboolean
Filter by whether this profile is active. Defaults to true.

typetext
Filter responses by account type, comma separated values are supported (e.g. iban,swift_code).

ownedByCustomerboolean
Filter to get accounts owned by the customer or not, leave out to get all accounts.

sizeinteger
Page size of the response. Defaults to a maximum of 20.

seekPositioninteger
Account ID to start the page of responses from in the response. null if no more pages.

sortinteger
Sorting strategy for the response. Comma separated options: firstly either id or currency, followed by asc or desc for direction.

Response
An array of Recipient objects is returned.

Example Request

curl -X GET https://api.sandbox.transferwise.tech/v2/accounts?profile={{profileId}}&currency={{currency}} \
     -H 'Authorization: Bearer <your api token>'
Example Response

{
  "content": [
    {
      "id": 40000000,
      "creatorId": 41000000,
      "profileId": 30000000,
      "name": {
        "fullName": "John Doe",
        "givenName": null,
        "familyName": null,
        "middleName": null,
        "patronymicName": null,
        "cannotHavePatronymicName": null
      },
      "currency": "GBP",
      "country": "GB",
      "type": "SortCode",
      "legalEntityType": "PERSON",
      "active": true,
      "details": {
        "reference": null,
        "accountNumber": "37778842",
        "sortCode": "040075",
        "hashedByLooseHashAlgorithm": "ad245621b974efa3ef870895c3wer419a3f01af18a8a5790b47645dba6304194"
      },
      "commonFieldMap": {
        "accountNumberField": "accountNumber",
        "bankCodeField": "sortCode"
      },
      "hash": "666ef880f8aa6113fa112ba6531d3ed2c26dd9fgbd7de5136bfb827a6e800479",
      "accountSummary": "(04-00-75) 37778842",
      "longAccountSummary": "GBP account ending in 8842",
      "displayFields": [
        {
          "key": "details/sortCode",
          "label": "UK sort code",
          "value": "04-00-75"
        },
        {
          "key": "details/accountNumber",
          "label": "Account number",
          "value": "37778842"
        }
      ],
      "isInternal": false,
      "ownedByCustomer": false
    }
  ],
  "sort": {
    "empty": true,
    "sorted": false,
    "unsorted": true
  },
  "size": 1
}
Get account by ID

v2
GET /v2/accounts/{{accountId}}

V1 and v2 versions are cross compatible, but the v2 endpoint provides some additional features.
Read more
Get recipient account info by ID.

Response
A Recipient object is returned.

Example Request

curl -X GET https://api.sandbox.transferwise.tech/v2/accounts/{{accountId}} \
     -H 'Authorization: Bearer <your api token>' 
Deactivate a recipient account 
DELETE /v2/accounts/{{accountId}}

Deletes a recipient by changing its status to inactive ("active": false). Requesting to delete a recipient that is already inactive will return an HTTP status 403 (forbidden).

Only active recipients can be deleted and a recipient cannot be reactivated, however you can create a new recipient with the same details instead if necessary.
Response
A complete Recipient object is returned, with the value of active set to false.

Example Request

curl -X DELETE https://api.sandbox.transferwise.tech/v2/accounts/{{accountId}} \
     -H 'Authorization: Bearer <your api token>'
Retrieve recipient account requirements dynamically

v1.1
Please note that to use v1.1 Accept-Minor-Version: 1 request header must be set.
Request
GET /v1/quotes/{{quoteId}}/account-requirements
POST /v1/quotes/{{quoteId}}/account-requirements
GET /v1/account-requirements?source=EUR&target=USD&sourceAmount=1000

You can use the data returned by this API to build a dynamic user interface for recipient creation. The GET and POST account-requirements endpoints help you to figure out which fields are required to create a valid recipient for different currencies. This is a step-by-step guide on how these endpoints work.

Use the GET endpoint to learn what datapoints are required to send a payment to your beneficiary. As you build that form, use the POST endpoint to learn if any additional datapoints are required as a result of passing a field that has "refreshRequirementsOnChange": true' in the GET response. You should be posting the same recipient account payload that will be posted to v1/accounts.

An example of this would be address.country. Some countries, like the United States, have a lower level organization, "state" or "territory". After POSTing the recipient payload with address.country = "US", the list of possible states will appear in the response.

The third endpoint above is used to get account requirements for a specific currency route and amount without referring to a quote but with the amount, source and target currencies passed as URL parameters. Generally this approach is not recommended, you should have your user create a quote resource first and use this to generate the recipient account requirements. This is because some payout methods will only surface when the profile-context is known, for example (at the time of this writing), Business Payments to Chinese Yuan use a different payout method than what is revealed by GET /v1/account-requirements?source=USD&target=CNY&sourceAmount=1000.

All new integrations should use the v1.1 of GET and POST account requirements, enabled using the Accept-Minor-Version header. It enables you to fetch the requirements including both the recipient name and email fields in the dynamic form, simplifying implementation of the form. Name and email address dynamic fields are required to support currencies such as KRW, JPY and RUB, and also remove the need for manual name validation.

These endpoints allow use of both v1 and v2 quotes using long or UUID based IDs, supporting legacy implementations using v1 quotes.

These endpoints accept an optional query parameter originatorLegalEntityType. When the transfer is initiated by a Third Party Partner we are not aware whether the actual sender is a business or person. In such cases, this parameter should be passed to receive correct requirements. The legal entity type should be one of the following values: BUSINESS, PRIVATE. This parameter is optional and the default value is the type of the partner profile.

Using account requirements
Response
typetext
"address"

fields[n].nametext
Field description

fields[n].group[n].keytext
Key is name of the field you should include in the JSON

fields[n].group[n].typetext
Display type of field. Can be text, select, radio or date

fields[n].group[n].refreshRequirementsOnChangeboolean
Tells you whether you should call POST account-requirements once the field value is set to discover required lower level fields.

fields[n].group[n].requiredboolean
Indicates if the field is mandatory or not

fields[n].group[n].displayFormattext
Display format pattern.

fields[n].group[n].exampletext
Example value.

fields[n].group[n].minLengthinteger
Min valid length of field value.

fields[n].group[n].maxLengthinteger
Max valid length of field value.

fields[n].group[n].validationRegexptext
Regexp validation pattern.

fields[n].group[n].validationAsynctext
Deprecated. This validation will instead be performed when submitting the request.

fields[n].group[n].valuesAllowed[n].keytext
List of allowed values. Value key

fields[n].group[n].valuesAllowed[n].nametext
List of allowed values. Value name.

Example Request

curl -X GET https://api.sandbox.transferwise.tech/v1/quotes/{{quoteId}}/account-requirements \
     -H 'Authorization: Bearer <your api token>' \
     -H 'Accept-Minor-Version: 1'
Collecting Recipient Address
Normally our account requirements will instruct when a recipient address is required. However, in some situations it's desirable to force the requirement so that an address can be provided to Wise. To do this, add the query parameter ?addressRequired=true to your request and address will always be returned as a required field.

The JSON snippets are just example to illustrate demonstrating the recipient address fields. These fields are subject to change. Your integration should be built in a way to handle unrecognized or changed fields.
recipient.address requirements example

...
  {
      "name": "Country",
      "group": [
          {
              "key": "address.country",
              "name": "Country",
              "type": "select",
              "refreshRequirementsOnChange": true,
              "required": true,
              "displayFormat": null,
              "example": "Choose a country",
              "minLength": null,
              "maxLength": null,
              "validationRegexp": null,
              "validationAsync": null,
              "valuesAllowed": [
                  #list of countries
              ]
          }
      ]
  },
  {
      "name": "City",
      "group": [
          {
              "key": "address.city",
              "name": "City",
              "type": "text",
              "refreshRequirementsOnChange": false,
              "required": true,
              "displayFormat": null,
              "example": "",
              "minLength": 1,
              "maxLength": 255,
              "validationRegexp": "^.{1,255}$",
              "validationAsync": null,
              "valuesAllowed": null
          }
      ]
  },
  {
      "name": "Recipient address",
      "group": [
          {
              "key": "address.firstLine",
              "name": "Recipient address",
              "type": "text",
              "refreshRequirementsOnChange": false,
              "required": true,
              "displayFormat": null,
              "example": "",
              "minLength": 1,
              "maxLength": 255,
              "validationRegexp": "^.{1,255}$",
              "validationAsync": null,
              "valuesAllowed": null
          }
      ]
  },
  {
      "name": "Post code",
      "group": [
          {
              "key": "address.postCode",
              "name": "Post code",
              "type": "text",
              "refreshRequirementsOnChange": false,
              "required": true,
              "displayFormat": null,
              "example": "",
              "minLength": 1,
              "maxLength": 32,
              "validationRegexp": "^.{1,32}$",
              "validationAsync": null,
              "valuesAllowed": null
          }
      ]
  },
...
Example Response from /account-requirements

[
  {
    "type": "south_korean_paygate",
    "title": "PayGate",
    "usageInfo": null,
    "fields": [
      {
        "name": "E-mail",
        "group": [
          {
            "key": "email",
            "name": "E-mail",
            "type": "text",
            "refreshRequirementsOnChange": false,
            "required": true,
            "displayFormat": null,
            "example": "example@example.ex",
            "minLength": null,
            "maxLength": null,
            "validationRegexp": "^[^\\s]+@[^\\s]+\\.[^\\s]{2,}$",
            "validationAsync": null,
            "valuesAllowed": null
          }
        ]
      },
      {
        "name": "Recipient type",
        "group": [
          {
            "key": "legalType",
            "name": "Recipient type",
            "type": "select",
            "refreshRequirementsOnChange": false,
            "required": true,
            "displayFormat": null,
            "example": "",
            "minLength": null,
            "maxLength": null,
            "validationRegexp": null,
            "validationAsync": null,
            "valuesAllowed": [
              {
                "key": "PRIVATE",
                "name": "Person"
              }
            ]
          }
        ]
      },
      {
        "name": "Full Name",
        "group": [
          {
            "key": "accountHolderName",
            "name": "Full Name",
            "type": "text",
            "refreshRequirementsOnChange": false,
            "required": true,
            "displayFormat": null,
            "example": "",
            "minLength": 2,
            "maxLength": 140,
            "validationRegexp": "^[0-9A-Za-zÀ-ÖØ-öø-ÿ-_()'*,.%#^@{}~<>+$\"\\[\\]\\\\ ]+$",
            "validationAsync": null,
            "valuesAllowed": null
          }
        ]
      },
      {
        "name": "Recipient's Date of Birth",
        "group": [
          {
            "key": "dateOfBirth",
            "name": "Recipient's Date of Birth",
            "type": "date",
            "refreshRequirementsOnChange": false,
            "required": true,
            "displayFormat": null,
            "example": "",
            "minLength": null,
            "maxLength": null,
            "validationRegexp": "^\\d{4}\\-\\d{2}\\-\\d{2}$",
            "validationAsync": null,
            "valuesAllowed": null
          }
        ]
      },
      {
        "name": "Recipient Bank Name",
        "group": [
          {
            "key": "bankCode",
            "name": "Recipient Bank Name",
            "type": "select",
            "refreshRequirementsOnChange": false,
            "required": true,
            "displayFormat": null,
            "example": "Choose recipient bank",
            "minLength": null,
            "maxLength": null,
            "validationRegexp": null,
            "validationAsync": null,
            "valuesAllowed": [
              {
                "key": "",
                "name": "Choose recipient bank"
              },
              ...
            ]
          }
        ]
      },
      {
        "name": "Account number (KRW accounts only)",
        "group": [
          {
            "key": "accountNumber",
            "name": "Account number (KRW accounts only)",
            "type": "text",
            "refreshRequirementsOnChange": false,
            "required": true,
            "displayFormat": null,
            "example": "1254693521232",
            "minLength": 10,
            "maxLength": 16,
            "validationRegexp": null,
            "validationAsync": null,
            "valuesAllowed": null
          }
        ]
      }
    ]
  },

  Transfer
A transfer is a payment order to recipient account based on a quote.

Once created, a transfer needs to be funded within the next fourteen days. Otherwise, it will be automatically canceled.

Endpoints
POST/v1/transfers
POST/v2/profiles/{{profileId}}/third-party-transfers
POST/v1/profiles/{{profileId}}/partner-licence-transfers
POST/v1/transfer-requirements
GET/v1/transfers/{{transferId}}
GET/v2/profiles/{{profileId}}/third-party-transfers/{{transferId}}
POST/v3/profiles/{{profileId}}/transfers/{{transferId}}/payments
GET/v1/transfers
PUT/v1/transfers/{{transferId}}/cancel
GET/v1/transfers/{{transferId}}/receipt.pdf
GET/v1/transfers/{{transferId}}/us-combined-receipt.pdf
GET/v1/transfers/{{transferId}}/documents/noc
GET/v1/transfers/{{transferId}}/invoices/bankingpartner
GET/v1/transfers/{{transferId}}/payments
GET/v2/transfers/{{transferId}}/invoices/bankingpartner
The Transfer resource 
There are 2 types of transfer resources: standard transfer resource and originator transfer resource. Please see below for differences between the two.

Standard Transfer 
Fields
idinteger
Transfer ID

userinteger
Your user ID

targetAccountinteger
Recipient account ID

sourceAccountinteger
Refund recipient account ID

quoteinteger
v1 quote ID

quoteUuidtext
v2 quote ID

statustext
Transfer current status For information about transfer statuses

referencetext
Deprecated, use details.reference instead

ratedecimal
Exchange rate value

createdtimestamp
Timestamp when transfer was created

businessinteger
Your business profile ID

transferRequestinteger
Deprecated

details.referencetext
Payment reference text

hasActiveIssuesboolean
Are there any pending issues which stop executing the transfer?

sourceCurrencytext
Source currency code

sourceValuedecimal
Transfer amount in source currency

targetCurrencytext
Target currency code

targetValuedecimal
Transfer amount in target currency

customerTransactionIdtext
Unique identifier randomly generated per transfer request by the calling client

payinSessionIdtext
ID of the Payin Session generated for the transfer, which can be used for certain payin methods when funding the transfer.

originatorgroup
Data block to capture payment originator details

originator.legalEntityTypetext
Payment originator legal type

originator.referencetext
Unique customer ID in your system

originator.name.givenNametext
Payment originator first name

originator.name.middleNamestext array
Payment originator middle name(s)

originator.name.familyNametext
Payment originator family name

originator.name.patronymicNametext
Payment originator patronymic name

originator.name.fullNametext
Payment originator full legal name

originator.dateOfBirthyyyy-mm-dd
Payment originator date of birth

originator.businessRegistrationCodetext
Payment originator business registry or incorporation number

originator.address.firstLinetext
Payment originator address first line

originator.address.citytext
Payment originator address city

originator.address.stateCodetext
Payment originator address state code

originator.address.countryCodetext
Payment originator address first line

originator.address.postCodetext
Payment originator address zip code

Originator transfer 
Fields
idinteger
Transfer ID

userinteger
Your user ID

targetAccountinteger
Recipient account ID

sourceAccountinteger
Refund recipient account ID

quotetext
quote ID

statustext
Transfer current status For information about transfer statuses

referencetext
Deprecated, use details.reference instead

ratedecimal
Exchange rate value

createdtimestamp
Timestamp when transfer was created

businessinteger
Your business profile ID

transferRequestinteger
Deprecated

details.referencetext
Payment reference text

hasActiveIssuesboolean
Are there any pending issues which stop executing the transfer?

sourceCurrencytext
Source currency code

sourceValuedecimal
Transfer amount in source currency

targetCurrencytext
Target currency code

targetValuedecimal
Transfer amount in target currency

originalTransferIdtext
Unique identifier randomly generated per transfer request by the calling client

payinSessionIdtext
ID of the Payin Session generated for the transfer, which can be used for certain payin methods when funding the transfer.

originatorgroup
Data block to capture payment originator details

originator.legalEntityTypetext
Payment originator legal type

originator.referencetext
Unique customer ID in your system

originator.name.givenNametext
Payment originator first name

originator.name.middleNamestext array
Payment originator middle name(s)

originator.name.familyNametext
Payment originator family name

originator.name.patronymicNametext
Payment originator patronymic name

originator.name.fullNametext
Payment originator full legal name

originator.dateOfBirthyyyy-mm-dd
Payment originator date of birth

originator.businessRegistrationCodetext
Payment originator business registry or incorporation number

originator.address.firstLinetext
Payment originator address first line

originator.address.citytext
Payment originator address city

originator.address.stateCodetext
Payment originator address state code

originator.address.countryCodetext
Payment originator address first line

originator.address.postCodetext
Payment originator address zip code

Standard Transfer Object

{
  "id": 16521632,
  "user": 4342275,
  "targetAccount": 8692237,
  "sourceAccount": null,
  "quote": null,
  "quoteUuid": "8fa9be20-ba43-4b15-abbb-9424e1481050",
  "status": "cancelled",
  "reference": "reference text",
  "rate": 0.89,
  "created": "2017-11-24 10:47:49",
  "business": null,
  "transferRequest": null,
  "details": {
    "reference": "Testing"
  },
  "hasActiveIssues": false,
  "sourceCurrency": "EUR",
  "sourceValue": 0,
  "targetCurrency": "GBP",
  "targetValue": 150,
  "customerTransactionId": "54a6bc09-cef9-49a8-9041-f1f0c654cd88",
  "payinSessionId": "23330542-8e9e-419f-95eb-312b880f92ad"
}
Originator Transfer Object

{
  "id": 16521632,
  "user": 4342275,
  "targetAccount": 8692237,
  "sourceAccount": null,
  "quote": "8fa9be20-ba43-4b15-abbb-9424e1481050",
  "status": "cancelled",
  "reference": "reference text",
  "rate": 0.89,
  "created": "2017-11-24 10:47:49",
  "business": null,
  "transferRequest": null,
  "details": {
    "reference": "Testing"
  },
  "originator": {
    "name": {
      "givenName": "John",
      "middleNames": [
        "Ryan"
      ],
      "familyName": "Godspeed",
      "patronymicName": null,
      "fullName": "John Godspeed"
    },
    "dateOfBirth": "1977-07-01",
    "reference": "CST-2991992",
    "legalEntityType": "PRIVATE",
    "businessRegistrationCode": null,
    "address": {
      "firstLine": "Salu tee 14",
      "city": "Tallinn",
      "stateCode": null,
      "countryCode": "EE",
      "postCode": "12112"
    },
    "accountDetails": "23456789"
  },
  "hasActiveIssues": false,
  "sourceCurrency": "EUR",
  "sourceValue": 0,
  "targetCurrency": "GBP",
  "targetValue": 150,
  "originalTransferId": "54a6bc09-cef9-49a8-9041-f1f0c654cd88",
  "payinSessionId": "23330542-8e9e-419f-95eb-312b880f92ad"
}
Create a transfer 
POST /v1/transfers

Request
sourceAccount (optional)integer
Refund recipient account ID

targetAccountinteger
Recipient account ID. You can create multiple transfers to same recipient account.

quoteUuidtext
V2 quote ID. You can only create one transfer per one quote. You cannot use same quote ID to create multiple transfers.

customerTransactionIduuid
This is required to perform idempotency check to avoid duplicate transfers in case of network failures or timeouts.

details.referencetext
Recipient will see this reference text in their bank statement. Maximum allowed characters depends on the currency route. Business Payments Tips article has a full list.

details.transferPurpose (conditionally required)text
For example when target currency is THB. See more about conditions at Transfers.Requirements

details.transferPurposeSubTransferPurpose (conditionally required)text
For example when target currency is CNY. See more about conditions at Transfers.Requirements

details.transferPurposeInvoiceNumber (conditionally required)text
For example when target currency is INR. See more about conditions at Transfers.Requirements

details.sourceOfFunds (conditionally required)text
For example when target currency is USD and transfer amount exceeds 80k. See more about conditions at Transfers.Requirements

There are options to deal with conditionally required fields:

Always call transfer-requirements endpoint and submit values only if indicated so.
Always provide values for these fields based on a dynamically retrieved list (transfer-requirements endpoint). It is possible these fields change over time, so take this into account if hard coding the options.
Contact api@wise.com if you have questions about this property.

Response
Returns a standard transfer object.

Avoiding duplicate transfers
We use customerTransactionId field to avoid duplicate transfer requests. If your initial call to create a transfer fails (error or timeout) then you should retry the call using the same value in the customerTransactionId field that you used in the original call. This way we can treat subsequent retry messages as repeat messages and will not create duplicate transfers to your account should one have succeeded before. You should not retry indefinitely but use a sensible limit, perhaps with a back-off approach.

Payment Approvals
If you use personal tokens and do not use client credentials, and if your business account has payment approvals, your application will run in to this error when attempting to create a transfer

Quote cannot be accepted with this request due to missing approval.

Consider removing the payment rule if you are going to use the API to create transfers.

Example Request

curl -X POST https://api.sandbox.transferwise.tech/v1/transfers \
     -H 'Authorization: Bearer <your api token>' \
     -H 'Content-Type: application/json' \
     -d '{
          "sourceAccount": <refund recipient account ID>,
          "targetAccount": <recipient account ID>,
          "quoteUuid": <quote ID>,
          "customerTransactionId": "<the unique identifier you generated for the transfer attempt>",
          "details" : {
              "reference" : "to my friend",
              "transferPurpose": "verification.transfers.purpose.pay.bills",
              "transferPurposeSubTransferPurpose": "verification.sub.transfers.purpose.pay.interpretation.service",
              "sourceOfFunds": "verification.source.of.funds.other"
            }
         }'
Create a third party transfer 
POST /v2/profiles/{{profileId}}/third-party-transfers

When creating a transfer on behalf of a third party, you must take note that:

The originator datablock is required. This details the ultimate sender of funds in the transfer.
Depending on the legal entity type of the originator (PRIVATE or BUSINESS), the required fields vary. Please refer the two sample request examples on the right.
OriginalTransferId field must be used. This is your own ID for the transfer.
Request
targetAccountinteger
Recipient account ID. You can create multiple transfers to same recipient account.

quotetext
V2 quote ID. You can only create one transfer per one quote.
You cannot use same quote ID to create multiple transfers.

originalTransferIdtext
Unique transfer ID in your system. We use this field also to perform idempotency check to avoid duplicate transfers in case of network failures or timeouts. You can only submit one transfer with same originalTransferId.

details.reference (optional)text
Recipient will see this reference text in their bank statement. Maximum allowed characters depends on the currency route. Business Payments Tips article has a full list.

originatorgroup
Data block to capture payment originator details.

originator.legalEntityTypetext
PRIVATE or BUSINESS. Payment originator legal type.

originator.referencetext
Unique customer ID in your system. This allows us to uniquely identify each originator. Required.

originator.nametext
Data block to capture the originator name details.
Depends on the type of legal entity (PRIVATE or BUSINESS), the required fields and inputs are different.

originator.name.givenNametext
Payment originator first name. Required if legalEntityType = PRIVATE.

originator.name.middleNames (optional)text array
Payment originator middle name(s). Used only if legalEntityType = PRIVATE.

originator.name.familyNametext
Payment originator family name. Required if legalEntityType = PRIVATE.

originator.name.patronymicName (optional)text
Payment originator patronymic name. Used only if legalEntityType = PRIVATE.

originator.name.fullNametext
Payment originator full legal name. Required if legalEntityType = BUSINESS.

originator.dateOfBirthyyyy-mm-dd
Payment originator date of birth. Required if legalEntityType = PRIVATE.

originator.businessRegistrationCodetext
Payment originator business registry number / incorporation number. Required if legalEntityType = BUSINESS.

originator.address.firstLinetext
Payment originator address first line. Required

originator.address.citytext
Payment originator address city. Required

originator.address.stateCodetext
Payment originator address state code. Required if address country code in (US, CA, BR, AU). See Countries and states

originator.address.countryCodetext
Payment originator address first line. Required

originator.address.postCode (optional)text
Originator address zip code.

originator.accountDetails (optional)text
Originator account number.

Response
Returns an originator transfer object.

You need to save the transfer ID for tracking its status later via webhooks.

Avoiding duplicate transfers
We use originalTransferId field to avoid duplicate transfer requests. When your first call fails (error or timeout) then you should use the same value in originalTransferId field that you used in the original call when you are submitting a retry message. This way we can treat subsequent retry messages as repeat messages and will not create duplicate transfers to your account.

Example Request - Personal

curl -X POST https://api.sandbox.transferwise.tech/v2/profiles/{{profileId}}/third-party-transfers \
     -H 'Authorization: Bearer <your api token>' \
     -H 'Content-Type: application/json' \
     -d '{
          "targetAccount": <recipient account ID>,
          "quote": "<quote ID>",
          "originalTransferId": "<unique transfer ID in your system>",
          "details" : {
              "reference" : "Ski trip"
          },
          "originator" : {
              "legalEntityType" : "PRIVATE",
              "reference" : "<unique customer ID in your system>",
              "name" : {
                "givenName": "John",
                "middleNames": ["Ryan"],
                "familyName": "Godspeed"
              },
              "dateOfBirth": "1977-07-01",
              "address" : {
                "firstLine": "Salu tee 100, Apt 4B",
                "city": "Tallinn",
                "countryCode": "EE",
                "postCode": "12112"
              }
          }
         }'
Example Request - Business

curl -X POST https://api.sandbox.transferwise.tech/v2/profiles/{{profileId}}/third-party-transfers \
     -H 'Authorization: Bearer <your api token>' \
     -H 'Content-Type: application/json' \
     -d '{
          "targetAccount": <recipient account ID>,
          "quote": "<quote ID>",
          "originalTransferId": "<unique transfer ID in your system>",
          "details" : {
              "reference" : "Payment for invoice 22092"
          },
          "originator" : {
              "legalEntityType" : "BUSINESS",
              "reference" : "<originator customer ID in your system>",
              "name" : {
                "fullName": "Hot Air Balloon Services Ltd"
              },
              "businessRegistrationCode": "1999212",
              "address" : {
                "firstLine": "Aiandi tee 1431",
                "city": "Tallinn",
                "countryCode": "EE",
                "postCode": "12112"
              }
          }
       }'
Example Request - Canadian Personal

curl -X POST https://api.sandbox.transferwise.tech/v2/profiles/{{profileId}}/third-party-transfers \
     -H 'Authorization: Bearer <your api token>' \
     -H 'Content-Type: application/json' \
     -d '{
          "targetAccount": <recipient account ID>,
          "quote": "<quote ID>",
          "originalTransferId": "<unique transfer ID in your system>",
          "details" : {
              "reference" : "Ski trip"
          },
          "originator" : {
              "legalEntityType" : "PRIVATE",
              "reference" : "<unique customer ID in your system>",
              "name" : {
                "givenName": "John",
                "middleNames": ["Ryan"],
                "familyName": "Godspeed"
              },
              "dateOfBirth": "1977-07-01",
              "address" : {
                "firstLine": "102-3393 Capilano Road",
                "city": "North Vancouver",
                "countryCode": "CA",
                "postCode": "V7R 4W7"
              },
              "accountDetails": "<the unique account number of the customer>"
          }
         }'
Create a partner license transfer 
POST /v1/profiles/{{profileId}}/partner-licence-transfers

This is very similar to Create transfers endpoint, but please note these differences:

originator datablock is additionally required
Request
sourceAccount (optional)integer
Refund recipient account ID.

targetAccountinteger
Recipient account ID. You can create multiple transfers to same recipient account.

quotetext
V2 quote ID. You can only create one transfer per one quote.
You cannot use same quote ID to create multiple transfers.

customerTransactionIdtext
Unique transfer ID in your system. We use this field also to perform idempotency check to avoid duplicate transfers in case of network failures or timeouts. You can only submit one transfer with same customerTransactionId.

details.reference (optional)text
Recipient will see this reference text in their bank statement. Maximum allowed characters depends on the currency route. Business Payments Tips article has a full list.

originatorgroup
Data block to capture payment originator details.

originator.legalEntityTypetext
PRIVATE or BUSINESS. Payment originator legal type.

originator.externalIdtext
Unique customer ID in your system. This allows us to uniquely identify each originator. Required.

originator.name.givenNametext
Payment originator first name. Required if legalEntityType = PRIVATE.

originator.name.middleNamestext array
Payment originator middle name(s). Used only if legalEntityType = PRIVATE. Optional

originator.name.familyNametext
Payment originator family name. Required if legalEntityType = PRIVATE.

originator.name.patronymicNametext
Payment originator patronymic name. Used only if legalEntityType = PRIVATE. Optional

originator.name.fullNametext
Payment originator full legal name. Required if legalEntityType = BUSINESS.

originator.dateOfBirthyyyy-mm-dd
Payment originator date of birth. Required if legalEntityType = PRIVATE.

originator.businessRegistrationCodetext
Payment originator business registry number / incorporation number. Required if legalEntityType = BUSINESS.

originator.address.firstLinetext
Payment originator address first line. Required

originator.address.citytext
Payment originator address city. Required

originator.address.stateCodetext
Payment originator address state code. Required if address country code in (US, CA, BR, AU). See Countries and states

originator.address.countryCodetext
Payment originator address first line. Required

originator.address.postCodetext
Originator address zip code. Optional

Response
Returns an originator transfer object.

You need to save the transfer ID for tracking its status later via webhooks.

Avoiding duplicate transfers
We use customerTransactionId field to avoid duplicate transfer requests. When your first call fails (error or timeout) then you should use the same value in customerTransactionId field that you used in the original call when you are submitting a retry message. This way we can treat subsequent retry messages as repeat messages and will not create duplicate transfers to your account.

Example Request - Personal

curl -X POST https://api.sandbox.transferwise.tech/v1/profiles/{{profileId}}/partner-licence-transfers \
     -H 'Authorization: Bearer <your api token>' \
     -H 'Content-Type: application/json' \
     -d '{
            "sourceAccount": <refund recipient account ID>,
            "targetAccount": <recipient account ID>,
            "quote": "<quote ID>",
            "customerTransactionId": "<unique transfer ID in your system>",
            "details" : {
              "reference" : "Ski trip"
            },
            "originator" : {
              "legalEntityType" : "PRIVATE",
              "reference" : "<unique customer ID in your system>",
              "name" : {
                "givenName": "John",
                "middleNames": ["Ryan"],
                "familyName": "Godspeed"
              },
              "dateOfBirth": "1977-07-01",
              "address" : {
                "firstLine": "Salu tee 100, Apt 4B",
                "city": "Tallinn",
                "countryCode": "EE",
                "postCode": "12112"
              },
              "accountDetails": "<the unique account number of the customer>"
            }
        }'
Example Request - Business

curl -X POST https://api.sandbox.transferwise.tech/v1/profiles/{{profileId}}/partner-licence-transfers \
     -H 'Authorization: Bearer <your api token>' \
     -H 'Content-Type: application/json' \
     -d '{
          "sourceAccount": <refund recipient account ID>,
          "targetAccount": <recipient account ID>,
          "quote": "<quote ID>",
          "customerTransactionId": "<unique transfer ID in your system>",
          "details" : {
              "reference" : "Payment for invoice 22092"
          },
          "originator" : {
              "legalEntityType" : "BUSINESS",
              "reference" : "<originator customer ID in your system>",
              "name" : {
                "fullName": "Hot Air Balloon Services Ltd"
              },
              "businessRegistrationCode": "1999212",
              "address" : {
                "firstLine": "Aiandi tee 1431",
                "city": "Tallinn",
                "countryCode": "EE",
                "postCode": "12112"
              },
              "accountDetails": "<the unique account number of the customer>"
          }
       }'
Requesting transfer requirements 
POST /v1/transfer-requirements

Almost every region has its own specific nuances when it comes to the nitty gritty details of domestic payment systems and money transfer regulations. The maximum allowed length of reference text is a good example. The US payment system, ACH, supports 10 characters only, but transfers within Mexico allow up to 100 characters, and so on.

The same is true for requirements arising from Anti Money Laundering regulations adopted in different countries. Depending on the chosen currencies and the amount to be transferred, either in one go or cumulatively over time, Wise may require more details about the customer's source of funds or transfer purpose, for example.

The endpoint /transfer-requirements exposes all these specific requirements based on the sender, the specific quote and selected target recipient account.

To make sure that processing of your customer's transfers does not get delayed because of missing details, we highly recommend to verify the transfer requirements before submitting any transfer and collecting the data we request from the user using the returned dynamic form.

Transfer Requirement Options
Transfer Referencestring
reference - General reference or memo field for a transfer. Mandatory for some transfers, required will be true. It is important to use the minLength, maxLength and validationRegexp in your interface to minimize errors.

Originator Legal Entity Type (optional)text
originatorLegalEntityType - Optional feature flag to identify the type of sender. Allowed values are PRIVATE or BUSINESS.
Note this field is required from March 2026.

Transfer Purposeselect
transferPurpose - A select list of values to help understand the purpose of the transfer. Often required when transfers are over a certain size or through a particular route. As an option is selected, you must refresh requirements, as additional fields could become required.

Sub Transfer Purposeselect
transferPurposeSubTransferPurpose - A secondary select list of values to further help understand the purpose of the transfer. As an option is selected, you must refresh requirements, as additional fields could become required.

Source of Fundsselect
sourceOfFunds - A select list of values to help understand the source of the funds. As an option is selected, you must refresh requirements, as additional fields could become required.

Transfer Natureselect
transferNature - A select list of values to help understand the reason for the transfer, only for routes to and from BRL. Note that transfer nature needs to be added to a quote through creation or update in order to correctly calculate the IOF tax.

Transfer Purpose Invoice Numbertext
transferPurposeInvoiceNumber - Mandatory for trade related transfers, required will be shown as true for these cases. It is important to use minLength, maxLength and validationRegexp in your interface to minimize errors.

As transfer requirements are part of a dynamic form, the list of options can change. The list above are the most common requirements and when they apply, but others may be included. Always design your integration to work dynamically with this endpoint.
Note: The originatorLegalEntityType field is currently optional, but will become required from March 2026. Please update your integration to include this field as soon as possible.

Transfers to-BRL or from-BRL require a transfer nature (see: transferNature). Transfer nature has some special handling:

Be aware when rendering this field that labels might be present more than once under the same key.
The chosen value must be added when creating a quote or via an update of an existing quote.
Failure to include a transfer nature as instructed will prevent the transfer from being sent.
Request
Prepare the request body to create transfer object first. Now post this request body to the transfer-requirements endpoint to figure out if there are any other required fields.

Analyze the returned list of fields. Our example includes reference, sourceOfFunds and transferPurpose fields. Field 'reference' is optional in this example. Fields 'sourceOfFunds' and 'transferPurpose' are required and both have refreshRequirementsOnChange=true which indicates that there could be additional fields required depending on the selected value.

In our example you will have to POST request to/v1/transfer-requirements` second time as well with values set for 'transferPurpose' and 'sourceOfFunds'. So in case you set sourceOfFunds = 'verification.source.of.funds.other' then another text field called "sourceOfFundsOther" is also required where you need to specify the details in free format.

Once you get to the point where you have provided values for all fields which have refreshRequirementsOnChange=true then you have complete set of fields to compose a valid request to create a transfer object. For example this is a valid request to create a transfer.

Response
typetext
"transfer"

fields[n].nametext
Field description

fields[n].group[n].keytext
Key is name of the field you should include in the JSON

fields[n].group[n].nametext
Field description

fields[n].group[n].typetext
Display type of field (e.g. text, select, etc)

fields[n].group[n].refreshRequirementsOnChangeboolean
Tells you whether you should call POST transfer-requirements once the field value is set to discover required lower level fields.

fields[n].group[n].requiredboolean
Indicates if the field is mandatory or not

fields[n].group[n].displayFormattext
Display format pattern.

fields[n].group[n].exampletext
Example value.

fields[n].group[n].minLengthinteger
Min valid length of field value.

fields[n].group[n].maxLengthinteger
Max valid length of field value.

fields[n].group[n].validationRegexptext
Regexp validation pattern.

fields[n].group[n].validationAsynctext
Deprecated. This validation will instead be performed when submitting the request.

fields[n].group[n].valuesAllowed[n].keytext
List of allowed values. Value key

fields[n].group[n].valuesAllowed[n].nametext
List of allowed values. Value name.

Example Request

curl -X POST https://api.sandbox.transferwise.tech/v1/transfer-requirements \
     -H 'Authorization: Bearer <your api token>' \
     -H 'Content-Type: application/json' \
     -d '{ 
            "targetAccount": <recipient account ID>,
            "quoteUuid": <quote ID>,
            "originatorLegalEntityType": "PRIVATE",
            "details": {
              "reference": "good times",
              "sourceOfFunds": "verification.source.of.funds.other",
              "sourceOfFundsOther": "Trust funds"
            },
            "customerTransactionId": "6D9188CF-FA59-44C3-87A2-4506CE9C1EA3"
         }'
Example Response

[
  {
    "type": "transfer",
    "fields": [
      {
        "name": "Transfer reference",
        "group": [
          {
            "key": "reference",
            "name": "Transfer reference",
            "type": "text",
            "refreshRequirementsOnChange": false,
            "required": false,
            "displayFormat": null,
            "example": null,
            "minLength": null,
            "maxLength": 10,
            "validationRegexp": "[a-zA-Z0-9- ]*",
            "validationAsync": null,
            "valuesAllowed": null
          }
        ]
      },
      {
        "name": "Transfer purpose",
        "group": [
          {
            "key": "transferPurpose",
            "name": "Transfer purpose",
            "type": "select",
            "refreshRequirementsOnChange": true,
            "required": true,
            "displayFormat": null,
            "example": null,
            "minLength": null,
            "maxLength": null,
            "validationRegexp": null,
            "validationAsync": null,
            "valuesAllowed": [
              {
                "key": "verification.transfers.purpose.purchase.property",
                "name": "Buying property abroad"
              },
              {
                "key": "verification.transfers.purpose.pay.bills",
                "name": "Rent or other property expenses"
              },
              {
                "key": "verification.transfers.purpose.mortgage",
                "name": "Mortgage payment"
              },
              {
                "key": "verification.transfers.purpose.pay.tuition",
                "name": "Tuition fees or studying expenses"
              },
              {
                "key": "verification.transfers.purpose.send.to.family",
                "name": "Sending money home to family"
              },
              {
                "key": "verification.transfers.purpose.living.expenses",
                "name": "General monthly living expenses"
              },
              {
                "key": "verification.transfers.purpose.other",
                "name": "Other"
              }
            ]
          },
          {
            "key": "transferPurposeSubTransferPurpose",
            "name": "Please select a specific reason for your transfer",
            "type": "select",
            "refreshRequirementsOnChange": true,
            "required": true,
            "displayFormat": null,
            "example": null,
            "minLength": null,
            "maxLength": null,
            "validationRegexp": null,
            "validationAsync": null,
            "valuesAllowed": [
              {
                  "key": "INTERPRETATION_SERVICE",
                  "name": "Interpretation service"
              },
              {
                  "key": "TRANSLATION_SERVICE",
                  "name": "Translation service"
              },
              {
                  "key": "HUMAN_RESOURCE_SERVICE",
                  "name": "Human resource service"
              },
              {
                  "key": "ESTATE_AGENCY_SERVICE",
                  "name": "Estate agency service"
              },
              {
                  "key": "SOFTWARE_DEVELOPMENT_SERVICE",
                  "name": "Software development service"
              },
              {
                  "key": "WEB_DESIGN_OR_DEVELOPMENT_SERVICE",
                  "name": "Web design or development service"
              },
              {
                  "key": "DRAFTING_LEGAL_SERVICE",
                  "name": "Drafting legal service"
              },
              {
                  "key": "LEGAL_RELATED_CERTIFICATION_SERVICE",
                  "name": "Legal related certification service"
              },
              {
                  "key": "ACCOUNTING_SERVICE",
                  "name": "Accounting service"
              },
              {
                  "key": "TAX_SERVICE",
                  "name": "Tax service"
              },
              {
                  "key": "ARCHITECTURAL_DECORATION_DESIGN_SERVICE",
                  "name": "Architectural decoration design service"
              },
              {
                  "key": "ADVERTISING_SERVICE",
                  "name": "Advertising service"
              },
              {
                  "key": "MARKET_RESEARCH_SERVICE",
                  "name": "Market research service"
              },
              {
                  "key": "EXHIBITION_BOOTH_SERVICE",
                  "name": "Exhibition booth service"
              }
            ]
          }
        ]
      },
      {
        "name": "Source of funds",
        "group": [
          {
            "key": "sourceOfFunds",
            "name": "Source of funds",
            "type": "select",
            "refreshRequirementsOnChange": true,
            "required": true,
            "displayFormat": null,
            "example": null,
            "minLength": null,
            "maxLength": null,
            "validationRegexp": null,
            "validationAsync": null,
            "valuesAllowed": [
              {
                "key": "verification.source.of.funds.salary",
                "name": "Salary"
              },
              {
                "key": "verification.source.of.funds.investment",
                "name": "Investments (stocks, properties, etc.)"
              },
              {
                "key": "verification.source.of.funds.inheritance",
                "name": "Inheritance"
              },
              {
                "key": "verification.source.of.funds.loan",
                "name": "Loan"
              },
              {
                "key": "verification.source.of.funds.other",
                "name": "Other"
              }
            ]
          }
        ]
      },
      {
        "name": "Brazilian regulation requires you to provide a reason behind your transaction.",
        "group": [
          {
            "key": "transferNature",
            "name": "Please select an option that best describes the reason for your transfer",
            "type": "select",
            "refreshRequirementsOnChange": false,
            "required": true,
            "displayFormat": null,
            "example": null,
            "minLength": null,
            "maxLength": null,
            "validationRegexp": null,
            "validationAsync": null,
            "valuesAllowed": [
              {
                "key": "CHARITABLE_DONATIONS",
                "name": "Donations to friends or family"
              },
              {
                "key": "MOVING_MONEY_BETWEEN_OWN_ACCOUNTS",
                "name": "Moving money between own accounts"
              },
              {
                "key": "INTERNATIONAL_TRAVEL",
                "name": "Tourism service"
              },
              {
                "key": "BUY_OR_SELL_COMPUTER_AND_INFORMATION_SERVICE",
                "name": "Technology service"
              },
              {
                "key": "BUY_OR_SELL_OTHER_SERVICE",
                "name": "Other service"
              },
              {
                "key": "BUY_OR_SELL_MERCHANDISE",
                "name": "Purchase of goods"
              },
              {
                "key": "BUY_OR_SELL_OTHER_SERVICE",
                "name": "Property rental"
              },
              {
                "key": "OTHER",
                "name": "Property purchase or sale"
              },
              {
                "key": "CHARITABLE_DONATIONS",
                "name": "Transfer without compensation"
              }
            ]
          }
        ]
      }
    ]
  }
]
Get a transfer by ID 
GET /v1/transfers/{{transferId}}

Get transfer info by ID. To receive dynamic updates as the state of the transfer changes, please see our documentation on webhooks.

Response
Returns a transfer object, with or without an originator block depending on the type of transfer.

Sample Request

curl -X GET https://api.sandbox.transferwise.tech/v1/transfers/{{transferId}} \
     -H 'Authorization: Bearer <your api token>'
Get a third party transfer by ID

v2
GET /v2/profiles/{{profileId}}/third-party-transfers/{{transferId}}

Get transfer info by ID. To receive dynamic updates as the state of the transfer changes, please see our documentation on webhooks.

Response
Returns an originator transfer object.

Sample Request

curl -X GET https://api.sandbox.transferwise.tech/v2/profiles/{{profileId}}/third-party-transfers/{{transferId}} \
     -H 'Authorization: Bearer <your api token>'
Fund a transfer 
POST /v3/profiles/{{profileId}}/transfers/{{transferId}}/payments

This endpoint is SCA protected when it applies. If your profile is registered within the UK and/or EEA, SCA most likely applies to you. Please read more about implementing SCA below. If you use mTLS and client credentials to make API requests, SCA does not apply.
Learn more
This API call is the final step for executing payouts when using a balance with Wise. Upon calling the endpoint, Wise will begin the processing of the transfer, depending on the status of funds.

When using the transfer by transfer settlement model, the following funding type(s) must be used:

BALANCE - Funds are pulled from a multi-currency account held with Wise.
BANK_TRANSFER - Manually send funds from your business bank account to pay for any transfers. Only applicable when using the Batch Group API.
When funding through the Bulk Settlement model, the following funding type(s) must be used:

TRUSTED_PRE_FUND_BULK - Funds for the transfer will be settled through a bulk payment at a later date. This method is not applicable to first party Payouts.
If funding from BALANCE, and your multi-currency account does not have the required funds to complete the action, then this call will fail with an "insufficient funds" error. Once funds are added and available, you must call this endpoint again.

{{profileId}} refers to the profile that created the transfer. It can be either your personal profile ID, or your business profile ID.

Request
typetext
"BALANCE"
This indicates the type of funding you would like to apply to the transfer.

partnerReference (conditionally required)string
The transaction/payment identifier in your system, uniquely identifies the transfer in your platform. This is required for the Cross Currency Bulk Settlement model.

Response
typetext
"BALANCE"
This indicates the type of funding you would like to apply to the transfer.

statustext
"COMPLETED" or "REJECTED"

errorCodetext
Failure reason. For example "balance.payment-option-unavailable".

Example Request

curl -X POST https://api.sandbox.transferwise.tech/v3/profiles/{{profileId}}/transfers/{{transferId}}/payments \
     -H 'Authorization: Bearer <your api token>' \
     -H 'Content-Type: application/json' \
     -d '{
            "type": "BALANCE"
         }'
Example Request - Balance - Completed

{
    "type": "BALANCE",
    "status": "COMPLETED",
    "errorCode": null
}
Example Request - Balance - Insufficient Funds

{
    "type": "BALANCE",
    "status": "REJECTED",
    "errorCode": "transfer.insufficient_funds"
}
List transfers for a profile 
GET /v1/transfers

Get the list of transfers for given user's profile (defaults to user's personal profile).

You can add query parameters to specify user's profile (personal or business), time period and/or payment status.

For example, you can query:

all failed payments created since last week
all completed payments created since yesterday
Request Parameters
profileinteger
User profile ID. If parameter is omitted, defaults to user's personal profile.

statustext
Comma separated list of one or more status codes to filter transfers. See Track transfer status for complete list of statuses.

sourceCurrencytext
Source currency code

targetCurrencytext
Target currency code

createdDateStartyyyy-mm-ddThh:mm:ss.sssZ
Starting date to filter transfers, inclusive of the provided date.

createdDateEndyyyy-mm-ddThh:mm:ss.sssZ
Ending date to filter transfers, inclusive of the provided date.

limitinteger
Maximum number of records to be returned in response

offsetinteger
Starting record number

Response
Returns an array of transfer objects, with or without an originator block depending on the type of each transfer.

Example Request

curl -X GET https://api.sandbox.transferwise.tech/v1/transfers
        ?profile={{profileId}}
        &status=funds_refunded
        &offset=0
        &limit=100
        &createdDateStart=2018-12-15
        &createdDateEnd=2018-12-30  \
     -H 'Authorization: Bearer <your api token>'
Cancel a transfer 
PUT /v1/transfers/{{transferId}}/cancel

Transfers may be cancelled up until the Transfer is sent. Cancellation is final - it can not be undone.

Response
Returns a transfer object, with or without an originator block depending on the type of the transfer.

Request Example

curl -X PUT https://api.sandbox.transferwise.tech/v1/transfers/{{transferId}}/cancel \
     -H 'Authorization: Bearer <your api token>'
Get a transfer receipt in PDF format 
GET /v1/transfers/{{transferId}}/receipt.pdf

Download transfer confirmation receipt in PDF format for transfers that are in status outgoing_payment_sent. the transfer state change webhook

If you service US retail consumers you must use us-combined-receipt instead of this endpoint
Response
Transfer confirmation receipt in Wise branded PDF format.

Request Example

curl -X GET https://api.sandbox.transferwise.tech/v1/transfers/{{transferId}}/receipt.pdf \
     -H 'Authorization: Bearer <your api token>' 
Get a transfer US combined receipt in PDF format 
GET /v1/transfers/{{transferId}}/us-combined-receipt.pdf

Download US combined receipt in PDF format for transfers that are in status incoming_payment_initiated and again when the status is updated to outgoing_payment_sent.

Response
The US Combined Receipt in Wise branded PDF format.

Request Example

curl -X GET https://api.sandbox.transferwise.tech/v1/transfers/{{transferId}}/us-combined-receipt.pdf \
     -H 'Authorization: Bearer <your api token>' 
Get a transfer non objection certificate (INR) 
GET /v1/transfers/{{transferId}}/documents/noc

Download transfer non objection certificate in PDF format for transfers that are in status outgoing_payment_sent.

This document can be used to obtain an Foreign Inward Remittance Certificate (FIRC) from the bank that paid out the transfer.

This is only applicable to INR payments with either a business sender or recipient.

Response
Non objection certificate in PDF format.

Request Example

curl -X GET https://api.sandbox.transferwise.tech/v1/transfers/{{transferId}}/documents/noc \
     -H 'Authorization: Bearer <your api token>'  \
     -H 'Accept: application/pdf'
List of completed payments 
GET /v1/transfers/{{transferId}}/payments

Fetch completed payments used to fund the transfer.

In most cases there should only be a single payment associated with the transfer. There are rare occasions that a transfer can be funded with multiple payment methods and when this occurs the first completed payment method would be used to calculate the fees provided on the quote.

Response
Response Parameters
idinteger
Transfer ID

methodstring
The payment method used to pay for the transfer

pricingVariant (optional)string
The qualifier that allows to apply different pricing policy within the same payment method. Often the value might be the payment method itself

amountdecimal
Transfer source amount

currencystring
Transfer source currency

timeCreatedtimestamp
Date of when payment was created

timeUpdatedtimestamp
Date of when payment was updated

Request Example

curl -X GET https://api.sandbox.transferwise.tech/v1/transfers/{{transferId}}/payments \
     -H 'Authorization: Bearer <your api token>' 
Response Example

[
  {
    "id": 50000000,
    "method": "BANK_TRANSFER",
    "pricingVariant": null,
    "amount": 1000.00,
    "currency": "GBP",
    "timeCreated": "2020-01-01T12:30:15.000Z",
    "timeUpdated": "2020-01-01T12:30:15.000Z"
  }
]
Get payout information 
To utilize this endpoint, you will need to replace transferID with the specific transfer's unique identifier. The transfer endpoint will return the details of the transfer, including the processorName, deliveryMode, bankingPartnerReference, bankingPartnerName, and mt103. This information will enable your recipients to track the transfer with their bank. It may take up to 3 days to get the correct information through this endpoint, as some partners don't share the information until 3 days later.

GET /v2/transfers/{{transferId}}/invoices/bankingpartner

Fetch banking reference information for transfers that are in outgoing_payment_sent status, enabling you to track transfers with the transfer recipient’s bank.

Request Parameters
transferIDtext
The unique identifier of the transfer.

Response
Response Parameters
processorNamestring
The legal entity that processed the transfer on behalf of the customer.

deliveryModestring
The delivery mode for the payment (e.g., Swift).

bankingPartnerReferencestring
The reference used by the partner bank to identify and track the transfer.

bankingPartnerNamestring
The name of the sending bank to the recipient's bank.

mt103string
The MT103 of the transfer, if available.

Request Example

curl -X GET https://api.sandbox.transferwise.tech/v2/transfers/{{transferId}}/invoices/bankingpartner \
     -H 'Authorization: Bearer <your api token>' 
Response Example

{
  "processorName": "Acme Bank Ltd.",
  "deliveryMode": "SWIFT",
  "bankingPartnerReference": "ABCD1234",
  "bankingPartnerName": "Global Bank Corp."
  "mt103": "{1:F01XXXXGBXXAXXX0000000000}{2:I103XXXXGBXXXXXXN}{3:{108:1234567}{111:001}{121:00000000-0000-0000-0000-000000000000}}{4:\n:20:1234567\n:23B:CRED\n:32A:221212USD12345,\n:33B:USD12345,\n:50K:/11111111\nSOME COMPANY INC.\n1 SOME STREET MIAMI 33132 US\n:59:/GB00000000000000\nCOMPANY NAME LTD\nUK LONDON 1234 GB\n:70:REFERENCE\n:71A:OUR\n:71G:USD11,\n-}\n"
}
Guides
API Reference
Changelog
Support
Search
Wise Platform © 2025

Fund a transfer 
POST /v3/profiles/{{profileId}}/transfers/{{transferId}}/payments

This endpoint is SCA protected when it applies. If your profile is registered within the UK and/or EEA, SCA most likely applies to you. Please read more about implementing SCA below. If you use mTLS and client credentials to make API requests, SCA does not apply.
Learn more
This API call is the final step for executing payouts when using a balance with Wise. Upon calling the endpoint, Wise will begin the processing of the transfer, depending on the status of funds.

When using the transfer by transfer settlement model, the following funding type(s) must be used:

BALANCE - Funds are pulled from a multi-currency account held with Wise.
BANK_TRANSFER - Manually send funds from your business bank account to pay for any transfers. Only applicable when using the Batch Group API.
When funding through the Bulk Settlement model, the following funding type(s) must be used:

TRUSTED_PRE_FUND_BULK - Funds for the transfer will be settled through a bulk payment at a later date. This method is not applicable to first party Payouts.
If funding from BALANCE, and your multi-currency account does not have the required funds to complete the action, then this call will fail with an "insufficient funds" error. Once funds are added and available, you must call this endpoint again.

{{profileId}} refers to the profile that created the transfer. It can be either your personal profile ID, or your business profile ID.

Request
typetext
"BALANCE"
This indicates the type of funding you would like to apply to the transfer.

partnerReference (conditionally required)string
The transaction/payment identifier in your system, uniquely identifies the transfer in your platform. This is required for the Cross Currency Bulk Settlement model.

Response
typetext
"BALANCE"
This indicates the type of funding you would like to apply to the transfer.

statustext
"COMPLETED" or "REJECTED"

errorCodetext
Failure reason. For example "balance.payment-option-unavailable".

Example Request

curl -X POST https://api.sandbox.transferwise.tech/v3/profiles/{{profileId}}/transfers/{{transferId}}/payments \
     -H 'Authorization: Bearer <your api token>' \
     -H 'Content-Type: application/json' \
     -d '{
            "type": "BALANCE"
         }'
Example Request - Balance - Completed

{
    "type": "BALANCE",
    "status": "COMPLETED",
    "errorCode": null
}
Example Request - Balance - Insufficient Funds

{
    "type": "BALANCE",
    "status": "REJECTED",
    "errorCode": "transfer.insufficient_funds"
}
List transfers for a profile 
GET /v1/transfers

Get the list of transfers for given user's profile (defaults to user's personal profile).

You can add query parameters to specify user's profile (personal or business), time period and/or payment status.

For example, you can query:

all failed payments created since last week
all completed payments created since yesterday
Request Parameters
profileinteger
User profile ID. If parameter is omitted, defaults to user's personal profile.

statustext
Comma separated list of one or more status codes to filter transfers. See Track transfer status for complete list of statuses.

sourceCurrencytext
Source currency code

targetCurrencytext
Target currency code

createdDateStartyyyy-mm-ddThh:mm:ss.sssZ
Starting date to filter transfers, inclusive of the provided date.

createdDateEndyyyy-mm-ddThh:mm:ss.sssZ
Ending date to filter transfers, inclusive of the provided date.

limitinteger
Maximum number of records to be returned in response

offsetinteger
Starting record number

Response
Returns an array of transfer objects, with or without an originator block depending on the type of each transfer.

Example Request

curl -X GET https://api.sandbox.transferwise.tech/v1/transfers
        ?profile={{profileId}}
        &status=funds_refunded
        &offset=0
        &limit=100
        &createdDateStart=2018-12-15
        &createdDateEnd=2018-12-30  \
     -H 'Authorization: Bearer <your api token>'
Cancel a transfer 
PUT /v1/transfers/{{transferId}}/cancel

Transfers may be cancelled up until the Transfer is sent. Cancellation is final - it can not be undone.

Response
Returns a transfer object, with or without an originator block depending on the type of the transfer.

Request Example

curl -X PUT https://api.sandbox.transferwise.tech/v1/transfers/{{transferId}}/cancel \
     -H 'Authorization: Bearer <your api token>'
Get a transfer receipt in PDF format 
GET /v1/transfers/{{transferId}}/receipt.pdf

Download transfer confirmation receipt in PDF format for transfers that are in status outgoing_payment_sent. the transfer state change webhook

If you service US retail consumers you must use us-combined-receipt instead of this endpoint
Response
Transfer confirmation receipt in Wise branded PDF format.

Request Example

curl -X GET https://api.sandbox.transferwise.tech/v1/transfers/{{transferId}}/receipt.pdf \
     -H 'Authorization: Bearer <your api token>' 
Get a transfer US combined receipt in PDF format 
GET /v1/transfers/{{transferId}}/us-combined-receipt.pdf

Download US combined receipt in PDF format for transfers that are in status incoming_payment_initiated and again when the status is updated to outgoing_payment_sent.

Response
The US Combined Receipt in Wise branded PDF format.

Request Example

curl -X GET https://api.sandbox.transferwise.tech/v1/transfers/{{transferId}}/us-combined-receipt.pdf \
     -H 'Authorization: Bearer <your api token>' 
Get a transfer non objection certificate (INR) 
GET /v1/transfers/{{transferId}}/documents/noc

Download transfer non objection certificate in PDF format for transfers that are in status outgoing_payment_sent.

This document can be used to obtain an Foreign Inward Remittance Certificate (FIRC) from the bank that paid out the transfer.

This is only applicable to INR payments with either a business sender or recipient.

Response
Non objection certificate in PDF format.

Request Example

curl -X GET https://api.sandbox.transferwise.tech/v1/transfers/{{transferId}}/documents/noc \
     -H 'Authorization: Bearer <your api token>'  \
     -H 'Accept: application/pdf'
List of completed payments 
GET /v1/transfers/{{transferId}}/payments

Fetch completed payments used to fund the transfer.

In most cases there should only be a single payment associated with the transfer. There are rare occasions that a transfer can be funded with multiple payment methods and when this occurs the first completed payment method would be used to calculate the fees provided on the quote.

Response
Response Parameters
idinteger
Transfer ID

methodstring
The payment method used to pay for the transfer

pricingVariant (optional)string
The qualifier that allows to apply different pricing policy within the same payment method. Often the value might be the payment method itself

amountdecimal
Transfer source amount

currencystring
Transfer source currency

timeCreatedtimestamp
Date of when payment was created

timeUpdatedtimestamp
Date of when payment was updated

Request Example

curl -X GET https://api.sandbox.transferwise.tech/v1/transfers/{{transferId}}/payments \
     -H 'Authorization: Bearer <your api token>' 
Response Example

[
  {
    "id": 50000000,
    "method": "BANK_TRANSFER",
    "pricingVariant": null,
    "amount": 1000.00,
    "currency": "GBP",
    "timeCreated": "2020-01-01T12:30:15.000Z",
    "timeUpdated": "2020-01-01T12:30:15.000Z"
  }
]
Get payout information 
To utilize this endpoint, you will need to replace transferID with the specific transfer's unique identifier. The transfer endpoint will return the details of the transfer, including the processorName, deliveryMode, bankingPartnerReference, bankingPartnerName, and mt103. This information will enable your recipients to track the transfer with their bank. It may take up to 3 days to get the correct information through this endpoint, as some partners don't share the information until 3 days later.

GET /v2/transfers/{{transferId}}/invoices/bankingpartner

Fetch banking reference information for transfers that are in outgoing_payment_sent status, enabling you to track transfers with the transfer recipient’s bank.

Request Parameters
transferIDtext
The unique identifier of the transfer.

Response
Response Parameters
processorNamestring
The legal entity that processed the transfer on behalf of the customer.

deliveryModestring
The delivery mode for the payment (e.g., Swift).

bankingPartnerReferencestring
The reference used by the partner bank to identify and track the transfer.

bankingPartnerNamestring
The name of the sending bank to the recipient's bank.

mt103string
The MT103 of the transfer, if available.
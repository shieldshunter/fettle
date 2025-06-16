export const RAW_DEFS = [
  {
    "name": "get_api_v1_ar_invoice_details",
    "description": "By default an AR invoice details response will include only the fields: commissionPercent, contactName, deliveryTicketDate, deliveryTicketNumber, discountPercent, GLAccount1, inventoryItemNumber, invoiceNumber, isTaxable, jobNumber, lastModDate, lineTotal, lineTotalForeign, partDescription, partNumber, PONumber, productCode, quantityCancelled, quantityOrdered, quantityShipped, revision, salesAccount, salesAmount1, salesAmountForeign1, taxStatus, uniqueID, unit, unitPrice, unitPriceForeign, workCode. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/ar-invoice-details"
  },
  {
    "name": "get_api_v1_ar_invoices",
    "description": "By default an AR invoice response will include only the fields: amountPaidSoFar, amountPaidSoFarForeign, ARAccount, currencyCode, customerCode, customerDescription, daysOverdue, deliverTicketNumber, discountDate, enteredBy, exchangeRate, invoiceDate, invoiceNumber, invoiceTotal, invoiceTotalForeign, lastModDate, location, netDueDate, notes, openInvoiceAmount, paymentDate, paymentStatus, periodNumber, projectedPayDate, salesID, taxAccount, taxCode, termsCode, territory, uniqueID, workCode. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/ar-invoices"
  },
  {
    "name": "get_api_v1_attendance_ticket_details",
    "description": "By default an Attendance Ticket Detail item response will include only the fields: accountingID, actualClockInDate, actualClockInTime, actualClockOutDate, actualClockOutTime, adjustedClockInDate, adjustedClockInTime, adjustedClockOutDate, adjustedClockOutTime, attendanceCode, clockOutDate, comments, createdBy, deviceNumber, employeeCode, employeeName, GLCode, isHoliday, isOvertime, lastModDate, lastModUser, OTCalcFlag, payRateCode, payRollRate, searchDate, shift, ticketDate, totalActualTime, totalAdjustedTime, uniqueID",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/attendance-ticket-details"
  },
  {
    "name": "patch_api_v1_attendance_ticket_details__id_",
    "description": "Updates an Attendance Ticket Detail",
    "parameters": {
      "type": "object",
      "properties": {
        "actualClockInTime": {
          "type": "string"
        },
        "actualClockOutTime": {
          "type": "string"
        },
        "adjustedClockInTime": {
          "type": "string"
        },
        "adjustedClockOutTime": {
          "type": "string"
        },
        "attendanceCode": {
          "type": "integer"
        },
        "clockOutDate": {
          "type": "string"
        },
        "comments": {
          "type": "string"
        },
        "GLCode": {
          "type": "string"
        },
        "isHoliday": {
          "type": "boolean"
        },
        "isOvertime": {
          "type": "boolean"
        },
        "payRateCode": {
          "type": "integer"
        },
        "shift": {
          "type": "integer"
        },
        "id": {
          "type": "string"
        }
      },
      "required": [
        "id"
      ]
    },
    "method": "patch",
    "path": "/api/v1/attendance-ticket-details/{id}"
  },
  {
    "name": "post_api_v1_attendance_tickets_ticketDate_employees_emplo_7609c5",
    "description": "Creates an Attendance Ticket Detail",
    "parameters": {
      "type": "object",
      "properties": {
        "actualClockInTime": {
          "type": "string"
        },
        "actualClockOutTime": {
          "type": "string"
        },
        "adjustedClockInTime": {
          "type": "string"
        },
        "adjustedClockOutTime": {
          "type": "string"
        },
        "attendanceCode": {
          "type": "integer"
        },
        "clockOutDate": {
          "type": "string"
        },
        "comments": {
          "type": "string"
        },
        "GLCode": {
          "type": "string"
        },
        "isHoliday": {
          "type": "boolean"
        },
        "isOvertime": {
          "type": "boolean"
        },
        "payRateCode": {
          "type": "integer"
        },
        "shift": {
          "type": "integer"
        },
        "ticketDate": {
          "type": "string"
        },
        "employeeCode": {
          "type": "string"
        }
      },
      "required": [
        "ticketDate",
        "employeeCode"
      ]
    },
    "method": "post",
    "path": "/api/v1/attendance-tickets/{ticketDate}/employees/{employeeCode}/attendance-ticket-details"
  },
  {
    "name": "get_api_v1_attendance_tickets",
    "description": "By default an attendance ticket response will include only the fields: employeeCode, employeeName, enteredBy, enteredDate, isExported, lastModDate, lastModUser, searchDate, ticketDate, uniqueID. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/attendance-tickets"
  },
  {
    "name": "post_api_v1_attendance_tickets",
    "description": "Creates an Attendance Ticket",
    "parameters": {
      "type": "object",
      "properties": {
        "employeeCode": {
          "type": "integer"
        },
        "ticketDate": {
          "type": "string"
        }
      },
      "required": [
        "employeeCode",
        "ticketDate"
      ]
    },
    "method": "post",
    "path": "/api/v1/attendance-tickets"
  },
  {
    "name": "get_api_v1_attendance_tickets_ticketDate_employees_employ_7f26a3",
    "description": "By default an attendance ticket response will include only the fields: employeeCode, employeeName, enteredBy, enteredDate, isExported, lastModDate, lastModUser, searchDate, ticketDate, uniqueID. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "ticketDate": {
          "type": "string"
        },
        "employeeCode": {
          "type": "string"
        },
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        }
      },
      "required": [
        "ticketDate",
        "employeeCode"
      ]
    },
    "method": "get",
    "path": "/api/v1/attendance-tickets/{ticketDate}/employees/{employeeCode}"
  },
  {
    "name": "get_api_v1_bin_locations",
    "description": "By default a bin location response will include only the fields: binLocation, cost, datePosted, deliveryTicketNumber, lastModDate, lastModUser, lotNumber, partNumber, POItemNumber, quantityOnHand, receiverNumber, uniqueID, vendorCode. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/bin-locations"
  },
  {
    "name": "get_api_v1_company",
    "description": "By default a company response will include all fields. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of fields to sort by."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the Filter Expression section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/company"
  },
  {
    "name": "get_api_v1_company_calendars",
    "description": "By default a company calendar response will include only the fields: calendarType, capacityFactor, code, date, hoursAvailable, hoursAvailableShift1, hoursAvailableShift2, hoursAvailableShift3, lastModDate, lastModUser, scheduleBegin, scheduleEnd, searchDate, shift1Begin, shift1DefaultEmployeeCode, shift1End, shift2Begin, shift2CapacityFactor, shift2DefaultEmployeeCode, shift2End, shift3Begin, shift3CapacityFactor, shift3DefaultEmployeeCode, shift3End, uniqueID. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/company-calendars"
  },
  {
    "name": "get_api_v1_contacts",
    "description": "By default a contact response will include only the fields: active, cellPhone, comments, contact, contactCode, email, extension, lastModDate, mobileEmail, object, phone, title, uniqueID. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/contacts"
  },
  {
    "name": "post_api_v1_contacts",
    "description": "Creates a Contact",
    "parameters": {
      "type": "object",
      "properties": {
        "active": {
          "type": "boolean"
        },
        "cellPhone": {
          "type": "string"
        },
        "comments": {
          "type": "string"
        },
        "contact": {
          "type": "string"
        },
        "contactCode": {
          "type": "string"
        },
        "email": {
          "type": "string"
        },
        "extension": {
          "type": "string"
        },
        "fax": {
          "type": "string"
        },
        "isOptedOut": {
          "type": "boolean"
        },
        "mobileEmail": {
          "type": "string"
        },
        "object": {
          "type": "string"
        },
        "phone": {
          "type": "string"
        },
        "title": {
          "type": "string"
        }
      },
      "required": [
        "contact",
        "contactCode",
        "object"
      ]
    },
    "method": "post",
    "path": "/api/v1/contacts"
  },
  {
    "name": "get_api_v1_contacts__object___contactCode___contact_",
    "description": "By default a contact response will include only the fields: active, cellPhone, code, comments, contact, uniqueID, email, extension, lastModDate, mobile, object, phone, title. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "object": {
          "type": "string"
        },
        "contactCode": {
          "type": "string"
        },
        "contact": {
          "type": "string"
        },
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        }
      },
      "required": [
        "object",
        "contactCode",
        "contact"
      ]
    },
    "method": "get",
    "path": "/api/v1/contacts/{object}/{contactCode}/{contact}"
  },
  {
    "name": "patch_api_v1_contacts__object___contactCode___contact_",
    "description": "Updates a Contact",
    "parameters": {
      "type": "object",
      "properties": {
        "active": {
          "type": "boolean"
        },
        "cellPhone": {
          "type": "string"
        },
        "comments": {
          "type": "string"
        },
        "email": {
          "type": "string"
        },
        "extension": {
          "type": "string"
        },
        "fax": {
          "type": "string"
        },
        "phone": {
          "type": "string"
        },
        "title": {
          "type": "string"
        },
        "object": {
          "type": "string"
        },
        "contactCode": {
          "type": "string"
        },
        "contact": {
          "type": "string"
        }
      },
      "required": [
        "object",
        "contactCode",
        "contact"
      ]
    },
    "method": "patch",
    "path": "/api/v1/contacts/{object}/{contactCode}/{contact}"
  },
  {
    "name": "get_api_v1_corrective_preventive_actions",
    "description": "By default a corrective action response will include only the fields: authorization, uniqueID, carDate, carJobNumber, carPrinted, closeOutDate, correctiveActionCode, correctiveActionNumber, customerCode, customerPONumber, customerRMANumber, description, enterBy, enterDate, feedbackNumber, immediateAction, implementationDate, lastModDate, lastModUser, orderNumber, partNumber, permanentAction, PONumber, qualityControlManager, quantityReturned, quantityToRework, reasonForReturn, responseDue, returnType, rmaItemNumber, rootCause, signatureOnFile, status, vendorCode, vendorReturnNumber, vendorRMANumber, verificationBy, verificationDate, verificationOfEffectiveness, verificationOfEffectivenessBy, verificationOfImplementation. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/corrective-preventive-actions"
  },
  {
    "name": "get_api_v1_corrective_preventive_actions_correctiveAction_43c25d",
    "description": "By default a corrective action response will include only the fields: authorization, uniqueID, carDate, carJobNumber, carPrinted, closeOutDate, correctiveActionCode, correctiveActionNumber, customerCode, customerPONumber, customerRMANumber, description, enterBy, enterDate, feedbackNumber, immediateAction, implementationDate, lastModDate, lastModUser, orderNumber, partNumber, permanentAction, PONumber, qualityControlManager, quantityReturned, quantityToRework, reasonForReturn, responseDue, returnType, rmaItemNumber, rootCause, signatureOnFile, status, vendorCode, vendorReturnNumber, vendorRMANumber, verificationBy, verificationDate, verificationOfEffectiveness, verificationOfEffectivenessBy, verificationOfImplementation. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "correctiveActionNumber": {
          "type": "string"
        },
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        }
      },
      "required": [
        "correctiveActionNumber"
      ]
    },
    "method": "get",
    "path": "/api/v1/corrective-preventive-actions/{correctiveActionNumber}"
  },
  {
    "name": "get_api_v1_currency_codes",
    "description": "By default a currency code response will include only the fields: accountingID, buyRate, currencyCode, uniqueID, currencyFormat, currencySymbol, dateEntered, decimalPlaces, decimalSymbol, description, enteredBy, formatShow, GLCode, lastModDate, lastModUser, negativeCurrencyFormat, negativeFormatShow, QBCurrencyCode, sellRate, thousandsSeparator. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/currency-codes"
  },
  {
    "name": "get_api_v1_customer_return_line_items",
    "description": "By default a customer return line item response will include only the fields: binLocation, correctiveActionNumber, createCAR, createNC, customerPONumber, customerRMANumber, deliveryTicketItemNumber, deliveryTicketNumber, description, lastModDate, lastModUser, lotNumber, ncNumber, originalJobNumber, originalOrderNumber, originalQuantityShipped, partDescription, partNumber, quantityGood, quantityReturned, quantityToRestock, quantityToRework, reasonCode, restockingPercent, reworkJobNumber, rmaItemNumber, status, uniqueID, unit. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/customer-return-line-items"
  },
  {
    "name": "get_api_v1_customer_return_releases",
    "description": "By default a customer return release response will include only the fields: binLocation, comments, customerRMANumber, lastModDate, lastModUser, lotNumber, quantityToRestock, quantityToRework, rmaItemNumber, uniqueID. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/customer-return-releases"
  },
  {
    "name": "get_api_v1_customer_returns",
    "description": "By default a customer return response will include only the fields: billCustomerForReturn, comment, correctiveActionCode, correctiveActionNumber, createCAR, createCreditMemo, createdInvoiceNumber, createNC, creditDate, creditedBy, customerCode, customerDescription, customerPONumber, customerRMANumber, dateEntered, debitPrinted, deliveryTicketNumber, enteredBy, inspectedBy, inspectionDate, issueDate, issuedBy, labelPrinted, lastModDate, lastModUser, orderDate, orderedBy, QCComment, reasonForReturn, receiveDate, receivedBy, receivingComment, status, uniqueID. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/customer-returns"
  },
  {
    "name": "get_api_v1_customers",
    "description": "By default a customer response will include only the fields: active, APContact, creditLimit, currencyCode, customerCode, customerName, lastModDate, phone, salesID, termsCode, uniqueID, website, workCode. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/customers"
  },
  {
    "name": "post_api_v1_customers",
    "description": "Creates a Customer",
    "parameters": {
      "type": "object",
      "properties": {
        "active": {
          "type": "boolean"
        },
        "billingAddress1": {
          "type": "string"
        },
        "billingCity": {
          "type": "string"
        },
        "billingCountry": {
          "type": "string"
        },
        "billingState": {
          "type": "string"
        },
        "billingZIPCode": {
          "type": "string"
        },
        "comments1": {
          "type": "string"
        },
        "comments2": {
          "type": "string"
        },
        "creditLimit": {
          "type": "number"
        },
        "creditStatus": {
          "type": "string"
        },
        "currencyCode": {
          "type": "string"
        },
        "customerCode": {
          "type": "string"
        },
        "customerName": {
          "type": "string"
        },
        "defaultPriority": {
          "type": "integer"
        },
        "discountPercent": {
          "type": "number"
        },
        "fax": {
          "type": "string"
        },
        "federalIDNumber": {
          "type": "string"
        },
        "GSTCode": {
          "type": "string"
        },
        "minimumOrder": {
          "type": "number"
        },
        "phone": {
          "type": "string"
        },
        "QBCustomerCode": {
          "type": "string"
        },
        "salesID": {
          "type": "string"
        },
        "taxCode": {
          "type": "string"
        },
        "termsCode": {
          "type": "string"
        },
        "user_Currency1": {
          "type": "number"
        },
        "user_Currency2": {
          "type": "number"
        },
        "user_Date1": {
          "type": "string"
        },
        "user_Date2": {
          "type": "string"
        },
        "user_Memo1": {
          "type": "string"
        },
        "user_Number1": {
          "type": "number"
        },
        "user_Number2": {
          "type": "number"
        },
        "user_Number3": {
          "type": "number"
        },
        "user_Number4": {
          "type": "number"
        },
        "user_Text1": {
          "type": "string"
        },
        "user_Text2": {
          "type": "string"
        },
        "user_Text3": {
          "type": "string"
        },
        "user_Text4": {
          "type": "string"
        },
        "website": {
          "type": "string"
        },
        "workCode": {
          "type": "string"
        },
        "shippingAddresses": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "location": {
                "type": "string"
              },
              "printCertification": {
                "type": "boolean"
              },
              "shippingAddress1": {
                "type": "string"
              },
              "shippingCity": {
                "type": "string"
              },
              "shippingCode": {
                "type": "string"
              },
              "shippingContact": {
                "type": "string"
              },
              "shippingCountry": {
                "type": "string"
              },
              "shippingFAX": {
                "type": "string"
              },
              "shippingPhone": {
                "type": "string"
              },
              "shippingState": {
                "type": "string"
              },
              "shippingZipCode": {
                "type": "string"
              },
              "shipToName": {
                "type": "string"
              },
              "shipVia": {
                "type": "string"
              },
              "territory": {
                "type": "string"
              }
            },
            "required": [
              "location"
            ]
          }
        }
      },
      "required": [
        "customerCode",
        "customerName"
      ]
    },
    "method": "post",
    "path": "/api/v1/customers"
  },
  {
    "name": "get_api_v1_customers__customerCode_",
    "description": "By default a customer response will include only the fields: active, APContact, creditLimit, currencyCode, customerCode, customerName, lastModDate, phone, salesID, termsCode, uniqueID, website, workCode. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "customerCode": {
          "type": "string"
        },
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        }
      },
      "required": [
        "customerCode"
      ]
    },
    "method": "get",
    "path": "/api/v1/customers/{customerCode}"
  },
  {
    "name": "patch_api_v1_customers__customerCode_",
    "description": "Updates a Customer",
    "parameters": {
      "type": "object",
      "properties": {
        "active": {
          "type": "boolean"
        },
        "billingAddress1": {
          "type": "string"
        },
        "billingCity": {
          "type": "string"
        },
        "billingCountry": {
          "type": "string"
        },
        "billingState": {
          "type": "string"
        },
        "billingZIPCode": {
          "type": "string"
        },
        "comments1": {
          "type": "string"
        },
        "comments2": {
          "type": "string"
        },
        "creditLimit": {
          "type": "number"
        },
        "currencyCode": {
          "type": "string"
        },
        "customerName": {
          "type": "string"
        },
        "discountPercent": {
          "type": "number"
        },
        "federalIDNumber": {
          "type": "string"
        },
        "GSTCode": {
          "type": "string"
        },
        "user_Currency1": {
          "type": "number"
        },
        "user_Currency2": {
          "type": "number"
        },
        "user_Date1": {
          "type": "string"
        },
        "user_Date2": {
          "type": "string"
        },
        "user_Memo1": {
          "type": "string"
        },
        "user_Number1": {
          "type": "number"
        },
        "user_Number2": {
          "type": "number"
        },
        "user_Number3": {
          "type": "number"
        },
        "user_Number4": {
          "type": "number"
        },
        "user_Text1": {
          "type": "string"
        },
        "user_Text2": {
          "type": "string"
        },
        "user_Text3": {
          "type": "string"
        },
        "user_Text4": {
          "type": "string"
        },
        "website": {
          "type": "string"
        },
        "customerCode": {
          "type": "string"
        }
      },
      "required": [
        "customerCode"
      ]
    },
    "method": "patch",
    "path": "/api/v1/customers/{customerCode}"
  },
  {
    "name": "get_api_v1_departments",
    "description": "By default a department response will include only the fields: active, departmentNumber, description, lastModDate, lastModUser, uniqueID. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/departments"
  },
  {
    "name": "get_api_v1_document_controls",
    "description": "By default a document control response will include only the fields: approvalComments, approvalDate, approvedBy, dateEntered, description, documentDate, documentNumber, documentStatus, documentType, enteredBy, fileLocation, lastModDate, lastModUser, printed, proposalComments, proposalDate, proposedBy, releaseComments, releaseDate, releasedBy, repositoryID, retiredBy, retirementComments, retirementDate, revision, revisionDate, uniqueID. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/document-controls"
  },
  {
    "name": "get_api_v1_document_histories",
    "description": "By default a document history response will include only the fields: comments, documentNumber, fileLocation, repositoryID, revision, revisionDate, spunOffFile, uniqueID, updatedJobs, updatedParts, userID. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/document-histories"
  },
  {
    "name": "get_api_v1_document_review",
    "description": "By default a document review response will include only the fields: completed, cost, description, documentNumber, uniqueID, employeeCode, endDate, invoiceNumber, jobNumber, lastModDate, lastModUser, reviewCode, startDate, vendorCode. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/document-review"
  },
  {
    "name": "get_api_v1_employee_trainings",
    "description": "By default an employee training response will include only the fields: completed, cost, description, employeeCode, employeeName, endDate, instructor, invoiceNumber, lastModDate, lastModUser, location, startDate, trainingCode, vendorCode, uniqueID. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/employee-trainings"
  },
  {
    "name": "get_api_v1_employees",
    "description": "By default an employee response will include only the fields: active, city, country, departmentNumber, employeeCode, employeeName, employeeShortName, lastModDate, phone, rate1, shiftID, state, uniqueID. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/employees"
  },
  {
    "name": "patch_api_v1_employees__employeeCode_",
    "description": "Updates an Employee",
    "parameters": {
      "type": "object",
      "properties": {
        "departmentNumber": {
          "type": "string"
        },
        "employeeName": {
          "type": "string"
        },
        "rate1": {
          "type": "number"
        },
        "shiftID": {
          "type": "integer"
        },
        "user_Currency1": {
          "type": "number"
        },
        "user_Currency2": {
          "type": "number"
        },
        "user_Date1": {
          "type": "string"
        },
        "user_Date2": {
          "type": "string"
        },
        "user_Memo1": {
          "type": "string"
        },
        "user_Number1": {
          "type": "number"
        },
        "user_Number2": {
          "type": "number"
        },
        "user_Number3": {
          "type": "number"
        },
        "user_Number4": {
          "type": "number"
        },
        "user_Text1": {
          "type": "string"
        },
        "user_Text2": {
          "type": "string"
        },
        "user_Text3": {
          "type": "string"
        },
        "user_Text4": {
          "type": "string"
        },
        "employeeCode": {
          "type": "string"
        }
      },
      "required": [
        "employeeCode"
      ]
    },
    "method": "patch",
    "path": "/api/v1/employees/{employeeCode}"
  },
  {
    "name": "get_api_v1_estimates",
    "description": "By default an estimate response will include only the fields: active, alternatePartNumber, calculationMethod, comments, customerCode, description, GLCode, leadTime, partNumber, productCode, purchaseFactor, purchasingGLCode, purchasingUnit, quantityOnHandBinLocation, revision, stockingCost, uniqueID, vendorCode1. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/estimates"
  },
  {
    "name": "post_api_v1_estimates",
    "description": "**Quantity breaks** *Note: If you set 'useDefaultQuantities' flag to true the new estimate will use the default quantity breaks from company maintenance and if it is false the new estimate will ignore the default quantity breaks values so all quantities that are not in the request will be 0.",
    "parameters": {
      "type": "object",
      "properties": {
        "active": {
          "type": "boolean"
        },
        "alternatePartNumber": {
          "type": "string"
        },
        "calculationMethod": {
          "type": "string"
        },
        "customerCode": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "GLCode": {
          "type": "string"
        },
        "leadTime": {
          "type": "integer"
        },
        "lockPrice": {
          "type": "boolean"
        },
        "markup1": {
          "type": "number"
        },
        "markup2": {
          "type": "number"
        },
        "markup3": {
          "type": "number"
        },
        "markup4": {
          "type": "number"
        },
        "markup5": {
          "type": "number"
        },
        "markup6": {
          "type": "number"
        },
        "markup7": {
          "type": "number"
        },
        "markup8": {
          "type": "number"
        },
        "partNumber": {
          "type": "string"
        },
        "partWeight": {
          "type": "number"
        },
        "price1": {
          "type": "number"
        },
        "price2": {
          "type": "number"
        },
        "price3": {
          "type": "number"
        },
        "price4": {
          "type": "number"
        },
        "price5": {
          "type": "number"
        },
        "price6": {
          "type": "number"
        },
        "price7": {
          "type": "number"
        },
        "price8": {
          "type": "number"
        },
        "pricingUnit": {
          "type": "string"
        },
        "productCode": {
          "type": "string"
        },
        "purchaseCost1": {
          "type": "number"
        },
        "purchaseCost2": {
          "type": "number"
        },
        "purchaseCost3": {
          "type": "number"
        },
        "purchaseCost4": {
          "type": "number"
        },
        "purchaseCost5": {
          "type": "number"
        },
        "purchaseCost6": {
          "type": "number"
        },
        "purchaseCost7": {
          "type": "number"
        },
        "purchaseCost8": {
          "type": "number"
        },
        "purchaseFactor": {
          "type": "number"
        },
        "purchaseQuantity1": {
          "type": "integer"
        },
        "purchaseQuantity2": {
          "type": "integer"
        },
        "purchaseQuantity3": {
          "type": "integer"
        },
        "purchaseQuantity4": {
          "type": "integer"
        },
        "purchaseQuantity5": {
          "type": "integer"
        },
        "purchaseQuantity6": {
          "type": "integer"
        },
        "purchaseQuantity7": {
          "type": "integer"
        },
        "purchaseQuantity8": {
          "type": "integer"
        },
        "purchasingGLCode": {
          "type": "string"
        },
        "purchasingUnit": {
          "type": "string"
        },
        "quantity1": {
          "type": "integer"
        },
        "quantity2": {
          "type": "integer"
        },
        "quantity3": {
          "type": "integer"
        },
        "quantity4": {
          "type": "integer"
        },
        "quantity5": {
          "type": "integer"
        },
        "quantity6": {
          "type": "integer"
        },
        "quantity7": {
          "type": "integer"
        },
        "quantity8": {
          "type": "integer"
        },
        "revision": {
          "type": "string"
        },
        "revisionDate": {
          "type": "string"
        },
        "useDefaultQuantities": {
          "type": "boolean"
        },
        "user_Currency1": {
          "type": "number"
        },
        "user_Currency2": {
          "type": "number"
        },
        "user_Date1": {
          "type": "string"
        },
        "user_Date2": {
          "type": "string"
        },
        "user_Memo1": {
          "type": "string"
        },
        "user_Number1": {
          "type": "number"
        },
        "user_Number2": {
          "type": "number"
        },
        "user_Number3": {
          "type": "number"
        },
        "user_Number4": {
          "type": "number"
        },
        "user_Text1": {
          "type": "string"
        },
        "user_Text2": {
          "type": "string"
        },
        "user_Text3": {
          "type": "string"
        },
        "user_Text4": {
          "type": "string"
        },
        "vendorCode1": {
          "type": "string"
        },
        "materials": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "description": {
                "type": "string"
              },
              "materialDetailID": {
                "type": "string"
              },
              "partWeight": {
                "type": "number"
              },
              "quantity": {
                "type": "number"
              },
              "stepNumber": {
                "type": "integer"
              },
              "subPartNumber": {
                "type": "string"
              },
              "unit": {
                "type": "string"
              },
              "unitCost": {
                "type": "number"
              },
              "unitPrice": {
                "type": "number"
              },
              "vendor": {
                "type": "string"
              }
            },
            "required": [
              "subPartNumber"
            ]
          }
        },
        "routings": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "cycleTime": {
                "type": "number"
              },
              "cycleUnit": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "setupTime": {
                "type": "number"
              },
              "stepNumber": {
                "type": "integer"
              },
              "timeUnit": {
                "type": "string"
              },
              "vendorCode": {
                "type": "string"
              },
              "workCenter": {
                "type": "string"
              },
              "workOrVendor": {
                "type": "string"
              }
            },
            "required": [
              "cycleUnit",
              "stepNumber",
              "timeUnit",
              "workOrVendor"
            ]
          }
        }
      },
      "required": [
        "partNumber"
      ]
    },
    "method": "post",
    "path": "/api/v1/estimates"
  },
  {
    "name": "get_api_v1_estimates__partNumber_",
    "description": "By default an estimate response will include only the fields: active, alternatePartNumber, calculationMethod, comments, customerCode, description, GLCode, leadTime, partNumber, productCode, purchaseFactor, purchasingGLCode, purchasingUnit, quantityOnHandBinLocation, revision, stockingCost, uniqueID, vendorCode1. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "partNumber": {
          "type": "string"
        },
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        }
      },
      "required": [
        "partNumber"
      ]
    },
    "method": "get",
    "path": "/api/v1/estimates/{partNumber}"
  },
  {
    "name": "patch_api_v1_estimates__partNumber_",
    "description": "Updates an Estimate",
    "parameters": {
      "type": "object",
      "properties": {
        "revision": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "revisionDate": {
          "type": "string"
        },
        "user_Currency1": {
          "type": "number"
        },
        "user_Currency2": {
          "type": "number"
        },
        "user_Date1": {
          "type": "string"
        },
        "user_Date2": {
          "type": "string"
        },
        "user_Memo1": {
          "type": "string"
        },
        "user_Number1": {
          "type": "number"
        },
        "user_Number2": {
          "type": "number"
        },
        "user_Number3": {
          "type": "number"
        },
        "user_Number4": {
          "type": "number"
        },
        "user_Text1": {
          "type": "string"
        },
        "user_Text2": {
          "type": "string"
        },
        "user_Text3": {
          "type": "string"
        },
        "user_Text4": {
          "type": "string"
        },
        "partNumber": {
          "type": "string"
        }
      },
      "required": [
        "partNumber"
      ]
    },
    "method": "patch",
    "path": "/api/v1/estimates/{partNumber}"
  },
  {
    "name": "get_api_v1_feedback",
    "description": "By default a feedback response will include only the fields: closeOut, closeOutDate, comments, contact, correctiveActionCode, createCAR, customerCode, customerPONumber, customerRMANumber, employeeCode, enterBy, enterDate, fax, feedbackCode, feedbackDate, feedbackNo, feedbackType, lastModDate, lastModUser, managerCloseOut, orderNumber, phone, resolution, status, uniqueID, vendorCode. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/feedback"
  },
  {
    "name": "get_api_v1_gl_codes",
    "description": "By default a GL Account response will include only the fields: accountingID, accountingCode, accumulationAccount, active, currencyCode, description, division, GLAccountNumber, lastModDate, lastModUser, uniqueID, vendorCode. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/gl-codes"
  },
  {
    "name": "get_api_v1_gl_codes__GLAccountNumber_",
    "description": "By default a GL Account response will include only the fields: accountingID, accountingCode, accumulationAccount, active, currencyCode, description, division, GLAccountNumber, lastModDate, lastModUser, uniqueID, vendorCode. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "GLAccountNumber": {
          "type": "string"
        },
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        }
      },
      "required": [
        "GLAccountNumber"
      ]
    },
    "method": "get",
    "path": "/api/v1/gl-codes/{GLAccountNumber}"
  },
  {
    "name": "get_api_v1_job_materials",
    "description": "By default a job requirement response will include the fields: binLocation1, binLocation2, binLocation3, binLocation4, binLocation5, binLocationCounter, datePosted, description, GLCode, jobNumber, lastModDate, lastModUser, lotNumber1, lotNumber2, lotNumber3, lotNumber4, lotNumber5, mainPart, manufacturingJobNumber, orderNumber, originalBinCost, outsideService, packingListDate, packingListNumber, partNumber, PODate, POItemNumber, PONumber, postedBy, postedFromStock, pricingUnit, productCode, quantityPosted1, quantityPosted2, quantityPosted3, quantityPosted4, quantityPosted5, receiverDate, receiverNumber, resalePrice, stepNumber, stockingCost, stockUnit, subAssemblyJobNumber, uniqueID, vendorCode, vendorInvoiceNumber, vendorType. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/job-materials"
  },
  {
    "name": "get_api_v1_job_materials__uniqueID_",
    "description": "By default a job material response will include the fields: binLocation1, binLocation2, binLocation3, binLocation4, binLocation5, binLocationCounter, datePosted, description, GLCode, jobNumber, lastModDate, lastModUser, lotNumber1, lotNumber2, lotNumber3, lotNumber4, lotNumber5, mainPart, manufacturingJobNumber, orderNumber, originalBinCost, outsideService, packingListDate, packingListNumber, partNumber, PODate, POItemNumber, PONumber, postedBy, postedFromStock, pricingUnit, productCode, quantityPosted1, quantityPosted2, quantityPosted3, quantityPosted4, quantityPosted5, receiverDate, receiverNumber, resalePrice, stepNumber, stockingCost, stockUnit, subAssemblyJobNumber, uniqueID, vendorCode, vendorInvoiceNumber, vendorType. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "uniqueID": {
          "type": "string"
        },
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        }
      },
      "required": [
        "uniqueID"
      ]
    },
    "method": "get",
    "path": "/api/v1/job-materials/{uniqueID}"
  },
  {
    "name": "get_api_v1_job_requirements",
    "description": "By default a job requirement response will include only the fields: certificationRequired, cost, dateProcessed, GLCode, jobDue, jobNumber, uniqueID, lastModDate, lastModUser, leadTime, orderNumber, outsideService, partDescription, partNumber, PODate, POItemNumber, PONumber, price, pricingUnit, productCode, purchaseQuantity, purchaseUnit, quantityToBuy, setupCharge, stepNumber, stockingUnit, temporaryJobDue, vendorCode, workCode. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/job-requirements"
  },
  {
    "name": "get_api_v1_job_requirements__uniqueID_",
    "description": "By default a job requirement response will include only the fields: certificationRequired, cost, dateProcessed, GLCode, jobDue, jobNumber, uniqueID, lastModDate, lastModUser, leadTime, orderNumber, outsideService, partDescription, partNumber, PODate, POItemNumber, PONumber, price, pricingUnit, productCode, purchaseQuantity, purchaseUnit, quantityToBuy, setupCharge, stepNumber, stockingUnit, temporaryJobDue, vendorCode, workCode. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "uniqueID": {
          "type": "string"
        },
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        }
      },
      "required": [
        "uniqueID"
      ]
    },
    "method": "get",
    "path": "/api/v1/job-requirements/{uniqueID}"
  },
  {
    "name": "get_api_v1_estimates__partNumber__materials__subPartNumber_",
    "description": "By default a material response will include only the fields: description, itemNumber, lastModDate, lastModUser, uniqueID, partNumber, partWeight, isPurchased, quantity, stepNumber, subPartNumber, totalCost, totalPrice, totalQuantity, totalWeight, unit, unitCost, unitPrice, vendor, materialDetailID. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "partNumber": {
          "type": "string"
        },
        "subPartNumber": {
          "type": "string"
        },
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        }
      },
      "required": [
        "partNumber",
        "subPartNumber"
      ]
    },
    "method": "get",
    "path": "/api/v1/estimates/{partNumber}/materials/{subPartNumber}"
  },
  {
    "name": "get_api_v1_materials",
    "description": "By default a material response will include only the fields: description, itemNumber, lastModDate, lastModUser, uniqueID, partNumber, partWeight, isPurchased, quantity, stepNumber, subPartNumber, totalCost, totalPrice, totalQuantity, totalWeight, unit, unitCost, unitPrice, vendor, materialDetailID. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of fields to sort by."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the Filter Expression section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/materials"
  },
  {
    "name": "get_api_v1_non_conformances",
    "description": "By default a non-conformance response will include only the fields: comment, correctiveActionNumber, customerCode, customerPONumber, department, disposition, employeeCode, enterBy, enterDate, inspectedBy, jobNumber, lastModDate, lastModUser, lotNumber, ncDescription, ncPrinted, ncCode, ncDate, ncNumber, uniqueID, orderNumber, other, partDescription, partNumber, poNumber, processDate, quantityReturned, quantity, reasonCode, responsibleMgr, returnItemNumber, returnNumber, returnType, status, vendorCode, vendorRMANumber. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/non-conformances"
  },
  {
    "name": "get_api_v1_non_conformances__ncNumber_",
    "description": "By default a non-conformance response will include only the fields: comment, correctiveActionNumber, customerCode, customerPONumber, department, disposition, employeeCode, enterBy, enterDate, inspectedBy, jobNumber, lastModDate, lastModUser, lotNumber, ncDescription, ncPrinted, ncCode, ncDate, ncNumber, uniqueID, orderNumber, other, partDescription, partNumber, poNumber, processDate, quantityReturned, quantity, reasonCode, responsibleMgr, returnItemNumber, returnNumber, returnType, status, vendorCode, vendorRMANumber. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "ncNumber": {
          "type": "string"
        },
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        }
      },
      "required": [
        "ncNumber"
      ]
    },
    "method": "get",
    "path": "/api/v1/non-conformances/{ncNumber}"
  },
  {
    "name": "get_api_v1_operation_codes",
    "description": "By default an operation code response will include only the fields: active, defaultCycleTime, defaultCycleUnit, defaultSetupTime, defaultTimeUnit, description, isUnattendedOperation, lastModDate, lastModUser, machinesRunByOperator, machinesJobRunOn, operationCode, uniqueID, operationNumber, percentEfficiency, scrapPercent, teamSize. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of fields to sort by."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the Filter Expression section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/operation-codes"
  },
  {
    "name": "get_api_v1_operation_codes__operationCode_",
    "description": "By default an operation code response will include only the fields: active, defaultCycleTime, defaultCycleUnit, defaultSetupTime, defaultTimeUnit, description, isUnattendedOperation, lastModDate, lastModUser, machinesRunByOperator, machinesJobRunOn, operationCode, uniqueID, operationNumber, percentEfficiency, scrapPercent, teamSize. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "operationCode": {
          "type": "string"
        },
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        }
      },
      "required": [
        "operationCode"
      ]
    },
    "method": "get",
    "path": "/api/v1/operation-codes/{operationCode}"
  },
  {
    "name": "get_api_v1_order_line_items",
    "description": "By default an order line item response will include only the fields: actualEndDate, actualStartDate, dateFinished, dueDate, estimatedEndDate, estimatedStartDate, itemNumber, jobNotes, jobNumber, masterJobNumber, orderNumber, partDescription, partNumber, pricingUnit, productCode, quantityCanceled, quantityOrdered, quantityShippedToCustomer, quantityShippedToStock, quantityToMake, quantityToStock, revision, status, totalActualHours, totalEstimatedHours, uniqueID, unitPrice, unitPriceForeign, workCode. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/order-line-items"
  },
  {
    "name": "post_api_v1_orders__orderNumber__order_line_items",
    "description": "**Parts from Quotes** *Note: If you add a new line where has a Quote asociated(quoteNumber, quoteItemNumber) then Part Description, Revision, Product Code and Work Code will be set from the quote and will ignore these fields from the request.",
    "parameters": {
      "type": "object",
      "properties": {
        "billingRate": {
          "type": "integer"
        },
        "commissionPercent": {
          "type": "number"
        },
        "discountPercent": {
          "type": "number"
        },
        "dueDate": {
          "type": "string"
        },
        "estimatedEndDate": {
          "type": "string"
        },
        "estimatedStartDate": {
          "type": "string"
        },
        "FOB": {
          "type": "string"
        },
        "isTaxable": {
          "type": "boolean"
        },
        "jobNotes": {
          "type": "string"
        },
        "miscCharges": {
          "type": "number"
        },
        "miscDescription": {
          "type": "string"
        },
        "partDescription": {
          "type": "string"
        },
        "partNumber": {
          "type": "string"
        },
        "pricingUnit": {
          "type": "string"
        },
        "priority": {
          "type": "integer"
        },
        "productCode": {
          "type": "string"
        },
        "quantityOrdered": {
          "type": "integer"
        },
        "quoteItemNumber": {
          "type": "integer"
        },
        "quoteNumber": {
          "type": "string"
        },
        "revision": {
          "type": "string"
        },
        "totalEstimatedHours": {
          "type": "number"
        },
        "unitPrice": {
          "type": "number"
        },
        "user_Currency1": {
          "type": "number"
        },
        "user_Currency2": {
          "type": "number"
        },
        "user_Date1": {
          "type": "string"
        },
        "user_Date2": {
          "type": "string"
        },
        "user_Memo1": {
          "type": "string"
        },
        "user_Number1": {
          "type": "number"
        },
        "user_Number2": {
          "type": "number"
        },
        "user_Number3": {
          "type": "number"
        },
        "user_Number4": {
          "type": "number"
        },
        "user_Text1": {
          "type": "string"
        },
        "user_Text2": {
          "type": "string"
        },
        "user_Text3": {
          "type": "string"
        },
        "user_Text4": {
          "type": "string"
        },
        "workCode": {
          "type": "string"
        },
        "releases": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "binLocation": {
                "type": "string"
              },
              "comments": {
                "type": "string"
              },
              "deliveryType": {
                "type": "integer"
              },
              "dueDate": {
                "type": "string"
              },
              "EDISoftItemNumber": {
                "type": "integer"
              },
              "lastModDate": {
                "type": "string"
              },
              "lastModUser": {
                "type": "string"
              },
              "lotNumber": {
                "type": "string"
              },
              "quantity": {
                "type": "integer"
              }
            },
            "required": [
              "quantity"
            ]
          }
        },
        "orderRoutings": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "certificationRequired": {
                "type": "boolean"
              },
              "cyclePrice": {
                "type": "number"
              },
              "cycleTime": {
                "type": "number"
              },
              "cycleUnit": {
                "type": "string"
              },
              "departmentNumber": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "employeeCode": {
                "type": "string"
              },
              "estimatedEndDate": {
                "type": "string"
              },
              "estimatedQuantity": {
                "type": "integer"
              },
              "estimatedStartDate": {
                "type": "string"
              },
              "ignoreVendorMinimum": {
                "type": "boolean"
              },
              "operationCode": {
                "type": "string"
              },
              "overlapSteps": {
                "type": "boolean"
              },
              "setupPrice": {
                "type": "number"
              },
              "setupTime": {
                "type": "number"
              },
              "shift2DefaultEmployeeCode": {
                "type": "string"
              },
              "shift3DefaultEmployeeCode": {
                "type": "string"
              },
              "stepNumber": {
                "type": "integer"
              },
              "timeUnit": {
                "type": "string"
              },
              "total": {
                "type": "number"
              },
              "vendorCode": {
                "type": "string"
              },
              "workCenter": {
                "type": "string"
              },
              "workCenterOrVendor": {
                "type": "string"
              }
            },
            "required": [
              "workCenterOrVendor"
            ]
          }
        },
        "orderNumber": {
          "type": "string"
        }
      },
      "required": [
        "partNumber",
        "orderNumber"
      ]
    },
    "method": "post",
    "path": "/api/v1/orders/{orderNumber}/order-line-items"
  },
  {
    "name": "get_api_v1_orders__orderNumber__order_line_items__itemNumber_",
    "description": "By default an order line item response will include only the fields: actualEndDate, actualStartDate, dateFinished, dueDate, estimatedEndDate, estimatedStartDate, itemNumber, jobNotes, jobNumber, masterJobNumber, orderNumber, partDescription, partNumber, pricingUnit, productCode, quantityCanceled, quantityOrdered, quantityShippedToCustomer, quantityShippedToStock, quantityToMake, quantityToStock, revision, status, totalActualHours, totalEstimatedHours, uniqueID, unitPrice, unitPriceForeign, workCode. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "orderNumber": {
          "type": "string"
        },
        "itemNumber": {
          "type": "string"
        },
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        }
      },
      "required": [
        "orderNumber",
        "itemNumber"
      ]
    },
    "method": "get",
    "path": "/api/v1/orders/{orderNumber}/order-line-items/{itemNumber}"
  },
  {
    "name": "patch_api_v1_orders__orderNumber__order_line_items__itemNumber_",
    "description": "Updates an Order Line Item",
    "parameters": {
      "type": "object",
      "properties": {
        "user_Currency1": {
          "type": "number"
        },
        "user_Currency2": {
          "type": "number"
        },
        "user_Date1": {
          "type": "string"
        },
        "user_Date2": {
          "type": "string"
        },
        "user_Memo1": {
          "type": "string"
        },
        "user_Number1": {
          "type": "number"
        },
        "user_Number2": {
          "type": "number"
        },
        "user_Number3": {
          "type": "number"
        },
        "user_Number4": {
          "type": "number"
        },
        "user_Text1": {
          "type": "string"
        },
        "user_Text2": {
          "type": "string"
        },
        "user_Text3": {
          "type": "string"
        },
        "user_Text4": {
          "type": "string"
        },
        "orderNumber": {
          "type": "string"
        },
        "itemNumber": {
          "type": "string"
        }
      },
      "required": [
        "orderNumber",
        "itemNumber"
      ]
    },
    "method": "patch",
    "path": "/api/v1/orders/{orderNumber}/order-line-items/{itemNumber}"
  },
  {
    "name": "get_api_v1_order_routings",
    "description": "By default an order routing response will include only the fields: actualEndDate, actualPiecesGood, actualPiecesScrap, actualStartDate, burdenRate, departmentNumber, description, employeeCode, estimatedEndDate, estimatedQuantity, estimatedStartDate, itemNumber, jobNumber, laborRate, lastModDate, leadTime, machinesRun, numberMachinesForJob, operationCode, orderNumber, partNumber, shift2DefaultEmployeeCode, shift3DefaultEmployeeCode, status, stepNumber, timeUnit, total, totalActualHours, totalEstimatedHours, totalHoursLeft, uniqueID, vendorCode, workCenter, workCenterOrVendor. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/order-routings"
  },
  {
    "name": "post_api_v1_orders_orderNumber_order_line_items_itemNumbe_bf07c9",
    "description": "Creates an Order Routing",
    "parameters": {
      "type": "object",
      "properties": {
        "certificationRequired": {
          "type": "boolean"
        },
        "cyclePrice": {
          "type": "number"
        },
        "cycleTime": {
          "type": "number"
        },
        "cycleUnit": {
          "type": "string"
        },
        "departmentNumber": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "employeeCode": {
          "type": "string"
        },
        "estimatedEndDate": {
          "type": "string"
        },
        "estimatedQuantity": {
          "type": "integer"
        },
        "estimatedStartDate": {
          "type": "string"
        },
        "ignoreVendorMinimum": {
          "type": "boolean"
        },
        "operationCode": {
          "type": "string"
        },
        "overlapSteps": {
          "type": "boolean"
        },
        "setupPrice": {
          "type": "number"
        },
        "setupTime": {
          "type": "number"
        },
        "shift2DefaultEmployeeCode": {
          "type": "string"
        },
        "shift3DefaultEmployeeCode": {
          "type": "string"
        },
        "stepNumber": {
          "type": "integer"
        },
        "timeUnit": {
          "type": "string"
        },
        "total": {
          "type": "number"
        },
        "vendorCode": {
          "type": "string"
        },
        "workCenter": {
          "type": "string"
        },
        "workCenterOrVendor": {
          "type": "string"
        },
        "orderNumber": {
          "type": "string"
        },
        "itemNumber": {
          "type": "string"
        }
      },
      "required": [
        "workCenterOrVendor",
        "orderNumber",
        "itemNumber"
      ]
    },
    "method": "post",
    "path": "/api/v1/orders/{orderNumber}/order-line-items/{itemNumber}/order-routings"
  },
  {
    "name": "get_api_v1_orders_orderNumber_order_line_items_itemNumber_ee7eef",
    "description": "By default an order routing response will include only the fields: actualEndDate, actualPiecesGood, actualPiecesScrap, actualStartDate, burdenRate, departmentNumber, description, employeeCode, estimatedEndDate, estimatedQuantity, estimatedStartDate, itemNumber, jobNumber, laborRate, lastModDate, leadTime, machinesRun, numberMachinesForJob, operationCode, orderNumber, partNumber, shift2DefaultEmployeeCode, shift3DefaultEmployeeCode, status, stepNumber, timeUnit, total, totalActualHours, totalEstimatedHours, totalHoursLeft, uniqueID, vendorCode, workCenter, workCenterOrVendor. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "orderNumber": {
          "type": "string"
        },
        "itemNumber": {
          "type": "string"
        },
        "stepNumber": {
          "type": "string"
        },
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        }
      },
      "required": [
        "orderNumber",
        "itemNumber",
        "stepNumber"
      ]
    },
    "method": "get",
    "path": "/api/v1/orders/{orderNumber}/order-line-items/{itemNumber}/order-routings/{stepNumber}"
  },
  {
    "name": "patch_api_v1_orders_orderNumber_order_line_items_itemNumb_e18986",
    "description": "Updates an Order Routing",
    "parameters": {
      "type": "object",
      "properties": {
        "operationCode": {
          "type": "string"
        },
        "employeeCode": {
          "type": "string"
        },
        "estimatedEndDate": {
          "type": "string"
        },
        "estimatedStartDate": {
          "type": "string"
        },
        "workCenter": {
          "type": "string"
        },
        "orderNumber": {
          "type": "string"
        },
        "itemNumber": {
          "type": "string"
        },
        "stepNumber": {
          "type": "string"
        }
      },
      "required": [
        "orderNumber",
        "itemNumber",
        "stepNumber"
      ]
    },
    "method": "patch",
    "path": "/api/v1/orders/{orderNumber}/order-line-items/{itemNumber}/order-routings/{stepNumber}"
  },
  {
    "name": "get_api_v1_orders",
    "description": "By default an order response will include only the fields: customerCode, customerDescription, dateEntered, lastModDate, orderNumber, orderTotal, orderTotalForeign, PONumber, salesID, status, termsCode, territory, uniqueID. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/orders"
  },
  {
    "name": "post_api_v1_orders",
    "description": "Note: If auto-numbering for orders is not enabled in company maintenance settings, you must specify an order number in your request. If auto-numbering is enabled, you may leave this field off the request and an order number will be assigned automatically.",
    "parameters": {
      "type": "object",
      "properties": {
        "addCustomerFromQuote": {
          "type": "boolean"
        },
        "allowExpiredQuoteItems": {
          "type": "boolean"
        },
        "country": {
          "type": "string"
        },
        "currencyCode": {
          "type": "string"
        },
        "customerCode": {
          "type": "string"
        },
        "customerDescription": {
          "type": "string"
        },
        "dateEntered": {
          "type": "string"
        },
        "exchangeRate": {
          "type": "number"
        },
        "fax": {
          "type": "string"
        },
        "GSTCode": {
          "type": "string"
        },
        "holdUntilAccountIsCurrent": {
          "type": "boolean"
        },
        "location": {
          "type": "string"
        },
        "mainDueDate": {
          "type": "string"
        },
        "mainPriority": {
          "type": "integer"
        },
        "markCustomerActive": {
          "type": "boolean"
        },
        "notesToCustomer": {
          "type": "string"
        },
        "orderNumber": {
          "type": "string"
        },
        "phone": {
          "type": "string"
        },
        "PONumber": {
          "type": "string"
        },
        "purchasingContact": {
          "type": "string"
        },
        "quoteNumber": {
          "type": "string"
        },
        "salesID": {
          "type": "string"
        },
        "saveOnDuplicateCustomerPONumber": {
          "type": "boolean"
        },
        "shippingAddress1": {
          "type": "string"
        },
        "shippingCity": {
          "type": "string"
        },
        "shippingCode": {
          "type": "string"
        },
        "shippingState": {
          "type": "string"
        },
        "shipToName": {
          "type": "string"
        },
        "shipVia": {
          "type": "string"
        },
        "shipZIP": {
          "type": "string"
        },
        "taxCode": {
          "type": "string"
        },
        "termsCode": {
          "type": "string"
        },
        "territory": {
          "type": "string"
        },
        "user_Currency1": {
          "type": "number"
        },
        "user_Currency2": {
          "type": "number"
        },
        "user_Date1": {
          "type": "string"
        },
        "user_Date2": {
          "type": "string"
        },
        "user_Memo1": {
          "type": "string"
        },
        "user_Number1": {
          "type": "number"
        },
        "user_Number2": {
          "type": "number"
        },
        "user_Number3": {
          "type": "number"
        },
        "user_Number4": {
          "type": "number"
        },
        "user_Text1": {
          "type": "string"
        },
        "user_Text2": {
          "type": "string"
        },
        "user_Text3": {
          "type": "string"
        },
        "user_Text4": {
          "type": "string"
        },
        "payload": {
          "type": "object",
          "description": "(payload trimmed \u2013 see API docs for full schema)",
          "properties": {}
        }
      },
      "required": [
        "customerCode"
      ]
    },
    "method": "post",
    "path": "/api/v1/orders"
  },
  {
    "name": "get_api_v1_orders__orderNumber_",
    "description": "By default an order response will include only the fields: customerCode, customerDescription, dateEntered, lastModDate, orderNumber, orderTotal, orderTotalForeign, PONumber, salesID, status, termsCode, territory, uniqueID. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "orderNumber": {
          "type": "string"
        },
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        }
      },
      "required": [
        "orderNumber"
      ]
    },
    "method": "get",
    "path": "/api/v1/orders/{orderNumber}"
  },
  {
    "name": "patch_api_v1_orders__orderNumber_",
    "description": "Updates an Order",
    "parameters": {
      "type": "object",
      "properties": {
        "user_Currency1": {
          "type": "number"
        },
        "user_Currency2": {
          "type": "number"
        },
        "user_Date1": {
          "type": "string"
        },
        "user_Date2": {
          "type": "string"
        },
        "user_Memo1": {
          "type": "string"
        },
        "user_Number1": {
          "type": "number"
        },
        "user_Number2": {
          "type": "number"
        },
        "user_Number3": {
          "type": "number"
        },
        "user_Number4": {
          "type": "number"
        },
        "user_Text1": {
          "type": "string"
        },
        "user_Text2": {
          "type": "string"
        },
        "user_Text3": {
          "type": "string"
        },
        "user_Text4": {
          "type": "string"
        },
        "orderNumber": {
          "type": "string"
        }
      },
      "required": [
        "orderNumber"
      ]
    },
    "method": "patch",
    "path": "/api/v1/orders/{orderNumber}"
  },
  {
    "name": "get_api_v1_packing_list_line_items",
    "description": "By default a packing list line item response will include only the fields: accountingID, contactName, containerNumber, customerPONumber, deliveryTicketItemNumber, deliveryTicketNumber, isTaxable, jobNumber, lastModDate, lastModUser, masterJobNumber, partDescription, partNumber, partWeight, quantityFromStock, quantityOpen, quantityToCancel, quantityToShip, quantityToStock, revision, uniqueID, unit. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/packing-list-line-items"
  },
  {
    "name": "get_api_v1_packing_lists",
    "description": "By default a packing list response will include only the fields: active, address1, city, commissionAccount, commissionPercent, country, lastModDate, lastModUser, name, phone, salesID, state, uniqueID, YTDCommission, YTDSales, zipCode. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/packing-lists"
  },
  {
    "name": "get_api_v1_product_codes",
    "description": "By default a product code response will include only the fields: active, ARAccount, cashDiscount, description, freightAccount, lastModDate, lastModUser, productCode, uniqueID, salesAccount. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/product-codes"
  },
  {
    "name": "get_api_v1_product_codes__productCode_",
    "description": "By default a product code response will include only the fields: active, ARAccount, cashDiscount, description, freightAccount, lastModDate, lastModUser, productCode, uniqueID, salesAccount. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "productCode": {
          "type": "string"
        },
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        }
      },
      "required": [
        "productCode"
      ]
    },
    "method": "get",
    "path": "/api/v1/product-codes/{productCode}"
  },
  {
    "name": "get_api_v1_purchase_order_line_items",
    "description": "By default a purchase order line item response will include only the fields: dateFinished, dueDate, itemNumber, lastModDate, outsideService, partDescription, partNumber, purchaseOrderNumber, quantityCanceled, quantityOrdered, quantityReceived, quantityRejected, revision, status, stepNumber, uniqueID, unit, unitCost, unitCostForeign. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/purchase-order-line-items"
  },
  {
    "name": "patch_api_v1_purchase_order_line_items_purchaseOrderNumbe_8ca879",
    "description": "Updates a Purchase Order Line Item",
    "parameters": {
      "type": "object",
      "properties": {
        "user_Currency1": {
          "type": "number"
        },
        "user_Currency2": {
          "type": "number"
        },
        "user_Date1": {
          "type": "string"
        },
        "user_Date2": {
          "type": "string"
        },
        "user_Memo1": {
          "type": "string"
        },
        "user_Number1": {
          "type": "number"
        },
        "user_Number2": {
          "type": "number"
        },
        "user_Number3": {
          "type": "number"
        },
        "user_Number4": {
          "type": "number"
        },
        "user_Text1": {
          "type": "string"
        },
        "user_Text2": {
          "type": "string"
        },
        "user_Text3": {
          "type": "string"
        },
        "user_Text4": {
          "type": "string"
        },
        "purchaseOrderNumber": {
          "type": "string"
        },
        "partNumber": {
          "type": "string"
        },
        "itemNumber": {
          "type": "string"
        }
      },
      "required": [
        "purchaseOrderNumber",
        "partNumber",
        "itemNumber"
      ]
    },
    "method": "patch",
    "path": "/api/v1/purchase-order-line-items/{purchaseOrderNumber}/{partNumber}/{itemNumber}"
  },
  {
    "name": "get_api_v1_purchase_order_releases",
    "description": "By default a purchase order release response will include only the fields: comments, dateReceived, dueDate, itemNumber, jobNumber, lastModDate, lastModUser, partNumber, PONumber, quantity, quantityCanceled, quantityRejected, receiverNumber, uniqueID. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/purchase-order-releases"
  },
  {
    "name": "get_api_v1_purchase_orders",
    "description": "By default a purchase order response will include only the fields: contact, currencyCode, dateEntered, lastModDate, phone, PONumber, purchasedBy, shipCode, status, uniqueID, vendorCode, vendorDescription, vendorQuoteNumber, vendorType. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/purchase-orders"
  },
  {
    "name": "get_api_v1_purchase_orders__PONumber_",
    "description": "By default a purchase order response will include only the fields: contact, currencyCode, dateEntered, lastModDate, phone, PONumber, purchasedBy, shipCode, status, uniqueID, vendorCode, vendorDescription, vendorQuoteNumber, vendorType. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "PONumber": {
          "type": "string"
        },
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        }
      },
      "required": [
        "PONumber"
      ]
    },
    "method": "get",
    "path": "/api/v1/purchase-orders/{PONumber}"
  },
  {
    "name": "patch_api_v1_purchase_orders__PONumber_",
    "description": "Updates a Purchase Order",
    "parameters": {
      "type": "object",
      "properties": {
        "user_Currency1": {
          "type": "number"
        },
        "user_Currency2": {
          "type": "number"
        },
        "user_Date1": {
          "type": "string"
        },
        "user_Date2": {
          "type": "string"
        },
        "user_Memo1": {
          "type": "string"
        },
        "user_Number1": {
          "type": "number"
        },
        "user_Number2": {
          "type": "number"
        },
        "user_Number3": {
          "type": "number"
        },
        "user_Number4": {
          "type": "number"
        },
        "user_Text1": {
          "type": "string"
        },
        "user_Text2": {
          "type": "string"
        },
        "user_Text3": {
          "type": "string"
        },
        "user_Text4": {
          "type": "string"
        },
        "PONumber": {
          "type": "string"
        }
      },
      "required": [
        "PONumber"
      ]
    },
    "method": "patch",
    "path": "/api/v1/purchase-orders/{PONumber}"
  },
  {
    "name": "get_api_v1_quote_line_items",
    "description": "By default a quote line item response will include only the fields: commissionPercent, delivery, description, discountPercent, FOB, isTaxable, itemNumber, jobNotes, jobNumber, lastModDate, lastModUser, miscCharge, miscChargeForeign, miscDescription, partNumber, price1, price2, price3, price4, price5, price6, price7, price8, priceForeign1, priceForeign2, priceForeign3, priceForeign4, priceForeign5, priceForeign6, priceForeign7, priceForeign8, quantity1, quantity2, quantity3, quantity4, quantity5, quantity6, quantity7, quantity8, quoteNumber, quotePart, revision, status, uniqueID, unit1, unit2, unit3, unit4, unit5, unit6, unit7, unit8, workCode. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/quote-line-items"
  },
  {
    "name": "get_api_v1_quotes__quoteNumber__quote_line_item__itemNumber_",
    "description": "By default a quote line item response will include only the fields: commissionPercent, delivery, description, discountPercent, FOB, isTaxable, itemNumber, jobNotes, jobNumber, lastModDate, lastModUser, miscCharge, miscChargeForeign, miscDescription, partNumber, price1, price2, price3, price4, price5, price6, price7, price8, priceForeign1, priceForeign2, priceForeign3, priceForeign4, priceForeign5, priceForeign6, priceForeign7, priceForeign8, quantity1, quantity2, quantity3, quantity4, quantity5, quantity6, quantity7, quantity8, quoteNumber, quotePart, revision, status, uniqueID, unit1, unit2, unit3, unit4, unit5, unit6, unit7, unit8, workCode. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "quoteNumber": {
          "type": "string"
        },
        "itemNumber": {
          "type": "string"
        },
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        }
      },
      "required": [
        "quoteNumber",
        "itemNumber"
      ]
    },
    "method": "get",
    "path": "/api/v1/quotes/{quoteNumber}/quote-line-item/{itemNumber}"
  },
  {
    "name": "post_api_v1_quotes__quoteNumber__quote_line_items",
    "description": "Please see the <a href='#currency-fields'>currency fields documentation</a> for information about the `price#`/`price#Foreign` and `miscCharge`/`miscChargeForeign` fields.",
    "parameters": {
      "type": "object",
      "properties": {
        "commissionPercent": {
          "type": "number"
        },
        "delivery": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "discountPercent": {
          "type": "number"
        },
        "FOB": {
          "type": "string"
        },
        "itemNumber": {
          "type": "integer"
        },
        "jobNotes": {
          "type": "string"
        },
        "jobNumber": {
          "type": "string"
        },
        "miscCharge": {
          "type": "number"
        },
        "miscChargeForeign": {
          "type": "number"
        },
        "miscDescription": {
          "type": "string"
        },
        "partNumber": {
          "type": "string"
        },
        "price1": {
          "type": "number"
        },
        "price2": {
          "type": "number"
        },
        "price3": {
          "type": "number"
        },
        "price4": {
          "type": "number"
        },
        "price5": {
          "type": "number"
        },
        "price6": {
          "type": "number"
        },
        "price7": {
          "type": "number"
        },
        "price8": {
          "type": "number"
        },
        "priceForeign1": {
          "type": "number"
        },
        "priceForeign2": {
          "type": "number"
        },
        "priceForeign3": {
          "type": "number"
        },
        "priceForeign4": {
          "type": "number"
        },
        "priceForeign5": {
          "type": "number"
        },
        "priceForeign6": {
          "type": "number"
        },
        "priceForeign7": {
          "type": "number"
        },
        "priceForeign8": {
          "type": "number"
        },
        "quantity1": {
          "type": "integer"
        },
        "quantity2": {
          "type": "integer"
        },
        "quantity3": {
          "type": "integer"
        },
        "quantity4": {
          "type": "integer"
        },
        "quantity5": {
          "type": "integer"
        },
        "quantity6": {
          "type": "integer"
        },
        "quantity7": {
          "type": "integer"
        },
        "quantity8": {
          "type": "integer"
        },
        "revision": {
          "type": "string"
        },
        "status": {
          "type": "string"
        },
        "uniqueID": {
          "type": "integer"
        },
        "unit1": {
          "type": "string"
        },
        "unit2": {
          "type": "string"
        },
        "unit3": {
          "type": "string"
        },
        "unit4": {
          "type": "string"
        },
        "unit5": {
          "type": "string"
        },
        "unit6": {
          "type": "string"
        },
        "unit7": {
          "type": "string"
        },
        "unit8": {
          "type": "string"
        },
        "user_Currency1": {
          "type": "number"
        },
        "user_Currency2": {
          "type": "number"
        },
        "user_Date1": {
          "type": "string"
        },
        "user_Date2": {
          "type": "string"
        },
        "user_Memo1": {
          "type": "string"
        },
        "user_Number1": {
          "type": "number"
        },
        "user_Number2": {
          "type": "number"
        },
        "user_Number3": {
          "type": "number"
        },
        "user_Number4": {
          "type": "number"
        },
        "user_Text1": {
          "type": "string"
        },
        "user_Text2": {
          "type": "string"
        },
        "user_Text3": {
          "type": "string"
        },
        "user_Text4": {
          "type": "string"
        },
        "workCode": {
          "type": "string"
        },
        "quoteNumber": {
          "type": "string"
        }
      },
      "required": [
        "quoteNumber"
      ]
    },
    "method": "post",
    "path": "/api/v1/quotes/{quoteNumber}/quote-line-items"
  },
  {
    "name": "patch_api_v1_quotes__quoteNumber__quote_line_items__itemNumber_",
    "description": "Please see the <a href='#currency-fields'>currency fields documentation</a> for information about the `price#`/`price#Foreign` and `miscCharge`/`miscChargeForeign` fields.",
    "parameters": {
      "type": "object",
      "properties": {
        "commissionPercent": {
          "type": "number"
        },
        "delivery": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "discountPercent": {
          "type": "number"
        },
        "FOB": {
          "type": "string"
        },
        "itemNumber": {
          "type": "string"
        },
        "jobNotes": {
          "type": "string"
        },
        "jobNumber": {
          "type": "string"
        },
        "miscCharge": {
          "type": "number"
        },
        "miscChargeForeign": {
          "type": "number"
        },
        "miscDescription": {
          "type": "string"
        },
        "partNumber": {
          "type": "string"
        },
        "price1": {
          "type": "number"
        },
        "price2": {
          "type": "number"
        },
        "price3": {
          "type": "number"
        },
        "price4": {
          "type": "number"
        },
        "price5": {
          "type": "number"
        },
        "price6": {
          "type": "number"
        },
        "price7": {
          "type": "number"
        },
        "price8": {
          "type": "number"
        },
        "priceForeign1": {
          "type": "number"
        },
        "priceForeign2": {
          "type": "number"
        },
        "priceForeign3": {
          "type": "number"
        },
        "priceForeign4": {
          "type": "number"
        },
        "priceForeign5": {
          "type": "number"
        },
        "priceForeign6": {
          "type": "number"
        },
        "priceForeign7": {
          "type": "number"
        },
        "priceForeign8": {
          "type": "number"
        },
        "quantity1": {
          "type": "integer"
        },
        "quantity2": {
          "type": "integer"
        },
        "quantity3": {
          "type": "integer"
        },
        "quantity4": {
          "type": "integer"
        },
        "quantity5": {
          "type": "integer"
        },
        "quantity6": {
          "type": "integer"
        },
        "quantity7": {
          "type": "integer"
        },
        "quantity8": {
          "type": "integer"
        },
        "revision": {
          "type": "string"
        },
        "status": {
          "type": "string"
        },
        "uniqueID": {
          "type": "integer"
        },
        "unit1": {
          "type": "string"
        },
        "unit2": {
          "type": "string"
        },
        "unit3": {
          "type": "string"
        },
        "unit4": {
          "type": "string"
        },
        "unit5": {
          "type": "string"
        },
        "unit6": {
          "type": "string"
        },
        "unit7": {
          "type": "string"
        },
        "unit8": {
          "type": "string"
        },
        "user_Currency1": {
          "type": "number"
        },
        "user_Currency2": {
          "type": "number"
        },
        "user_Date1": {
          "type": "string"
        },
        "user_Date2": {
          "type": "string"
        },
        "user_Memo1": {
          "type": "string"
        },
        "user_Number1": {
          "type": "number"
        },
        "user_Number2": {
          "type": "number"
        },
        "user_Number3": {
          "type": "number"
        },
        "user_Number4": {
          "type": "number"
        },
        "user_Text1": {
          "type": "string"
        },
        "user_Text2": {
          "type": "string"
        },
        "user_Text3": {
          "type": "string"
        },
        "user_Text4": {
          "type": "string"
        },
        "workCode": {
          "type": "string"
        },
        "quoteNumber": {
          "type": "string"
        }
      },
      "required": [
        "quoteNumber",
        "itemNumber"
      ]
    },
    "method": "patch",
    "path": "/api/v1/quotes/{quoteNumber}/quote-line-items/{itemNumber}"
  },
  {
    "name": "get_api_v1_quotes",
    "description": "By default a quote response will include only the fields: quoteNumber, customerCode, customerName, address1, phone, dateEntered, quotedBy, contactName, salesID, followUpDate, expireDate, uniqueID. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/quotes"
  },
  {
    "name": "post_api_v1_quotes",
    "description": "Creates a Quote",
    "parameters": {
      "type": "object",
      "properties": {
        "lineItems": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "commissionPercent": {
                "type": "number"
              },
              "delivery": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "discountPercent": {
                "type": "number"
              },
              "FOB": {
                "type": "string"
              },
              "itemNumber": {
                "type": "integer"
              },
              "jobNotes": {
                "type": "string"
              },
              "jobNumber": {
                "type": "string"
              },
              "miscCharge": {
                "type": "number"
              },
              "miscChargeForeign": {
                "type": "number"
              },
              "miscDescription": {
                "type": "string"
              },
              "partNumber": {
                "type": "string"
              },
              "price1": {
                "type": "number"
              },
              "price2": {
                "type": "number"
              },
              "price3": {
                "type": "number"
              },
              "price4": {
                "type": "number"
              },
              "price5": {
                "type": "number"
              },
              "price6": {
                "type": "number"
              },
              "price7": {
                "type": "number"
              },
              "price8": {
                "type": "number"
              },
              "priceForeign1": {
                "type": "number"
              },
              "priceForeign2": {
                "type": "number"
              },
              "priceForeign3": {
                "type": "number"
              },
              "priceForeign4": {
                "type": "number"
              },
              "priceForeign5": {
                "type": "number"
              },
              "priceForeign6": {
                "type": "number"
              },
              "priceForeign7": {
                "type": "number"
              },
              "priceForeign8": {
                "type": "number"
              },
              "quantity1": {
                "type": "integer"
              },
              "quantity2": {
                "type": "integer"
              },
              "quantity3": {
                "type": "integer"
              },
              "quantity4": {
                "type": "integer"
              },
              "quantity5": {
                "type": "integer"
              },
              "quantity6": {
                "type": "integer"
              },
              "quantity7": {
                "type": "integer"
              },
              "quantity8": {
                "type": "integer"
              },
              "revision": {
                "type": "string"
              },
              "status": {
                "type": "string"
              },
              "uniqueID": {
                "type": "integer"
              },
              "unit1": {
                "type": "string"
              },
              "unit2": {
                "type": "string"
              },
              "unit3": {
                "type": "string"
              },
              "unit4": {
                "type": "string"
              },
              "unit5": {
                "type": "string"
              },
              "unit6": {
                "type": "string"
              },
              "unit7": {
                "type": "string"
              },
              "unit8": {
                "type": "string"
              },
              "user_Currency1": {
                "type": "number"
              },
              "user_Currency2": {
                "type": "number"
              },
              "user_Date1": {
                "type": "string"
              },
              "user_Date2": {
                "type": "string"
              },
              "user_Memo1": {
                "type": "string"
              },
              "user_Number1": {
                "type": "number"
              },
              "user_Number2": {
                "type": "number"
              },
              "user_Number3": {
                "type": "number"
              },
              "user_Number4": {
                "type": "number"
              },
              "user_Text1": {
                "type": "string"
              },
              "user_Text2": {
                "type": "string"
              },
              "user_Text3": {
                "type": "string"
              },
              "user_Text4": {
                "type": "string"
              },
              "workCode": {
                "type": "string"
              }
            }
          }
        },
        "address1": {
          "type": "string"
        },
        "city": {
          "type": "string"
        },
        "contactName": {
          "type": "string"
        },
        "country": {
          "type": "string"
        },
        "currencyCode": {
          "type": "string"
        },
        "customerCode": {
          "type": "string"
        },
        "customerName": {
          "type": "string"
        },
        "dateEntered": {
          "type": "string"
        },
        "exchangeRate": {
          "type": "number"
        },
        "expireDate": {
          "type": "string"
        },
        "fax": {
          "type": "string"
        },
        "followUpDate": {
          "type": "string"
        },
        "GSTCode": {
          "type": "string"
        },
        "inquiryNumber": {
          "type": "string"
        },
        "isFreeFormCustomer": {
          "type": "boolean"
        },
        "location": {
          "type": "string"
        },
        "notes": {
          "type": "string"
        },
        "phone": {
          "type": "string"
        },
        "quotedBy": {
          "type": "string"
        },
        "quoteNumber": {
          "type": "string"
        },
        "salesID": {
          "type": "string"
        },
        "shippingCode": {
          "type": "string"
        },
        "shipToName": {
          "type": "string"
        },
        "shipVia": {
          "type": "string"
        },
        "state": {
          "type": "string"
        },
        "taxCode": {
          "type": "string"
        },
        "termsCode": {
          "type": "string"
        },
        "territory": {
          "type": "string"
        },
        "user_Currency1": {
          "type": "number"
        },
        "user_Currency2": {
          "type": "number"
        },
        "user_Date1": {
          "type": "string"
        },
        "user_Date2": {
          "type": "string"
        },
        "user_Memo1": {
          "type": "string"
        },
        "user_Number1": {
          "type": "number"
        },
        "payload": {
          "type": "object",
          "description": "(payload trimmed \u2013 see API docs for full schema)",
          "properties": {}
        }
      },
      "required": [
        "customerCode"
      ]
    },
    "method": "post",
    "path": "/api/v1/quotes"
  },
  {
    "name": "get_api_v1_quotes__quoteNumber_",
    "description": "By default a quote response will include only the fields: quoteNumber, customerCode, customerName, address1, phone, dateEntered, quotedBy, contactName, salesID, followUpDate, expireDate, uniqueID. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "quoteNumber": {
          "type": "string"
        },
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        }
      },
      "required": [
        "quoteNumber"
      ]
    },
    "method": "get",
    "path": "/api/v1/quotes/{quoteNumber}"
  },
  {
    "name": "patch_api_v1_quotes__quoteNumber_",
    "description": "Updates a Quote",
    "parameters": {
      "type": "object",
      "properties": {
        "lineItems": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "commissionPercent": {
                "type": "number"
              },
              "delivery": {
                "type": "string"
              },
              "description": {
                "type": "string"
              },
              "discountPercent": {
                "type": "number"
              },
              "FOB": {
                "type": "string"
              },
              "itemNumber": {
                "type": "integer"
              },
              "jobNotes": {
                "type": "string"
              },
              "jobNumber": {
                "type": "string"
              },
              "miscCharge": {
                "type": "number"
              },
              "miscChargeForeign": {
                "type": "number"
              },
              "miscDescription": {
                "type": "string"
              },
              "partNumber": {
                "type": "string"
              },
              "price1": {
                "type": "number"
              },
              "price2": {
                "type": "number"
              },
              "price3": {
                "type": "number"
              },
              "price4": {
                "type": "number"
              },
              "price5": {
                "type": "number"
              },
              "price6": {
                "type": "number"
              },
              "price7": {
                "type": "number"
              },
              "price8": {
                "type": "number"
              },
              "priceForeign1": {
                "type": "number"
              },
              "priceForeign2": {
                "type": "number"
              },
              "priceForeign3": {
                "type": "number"
              },
              "priceForeign4": {
                "type": "number"
              },
              "priceForeign5": {
                "type": "number"
              },
              "priceForeign6": {
                "type": "number"
              },
              "priceForeign7": {
                "type": "number"
              },
              "priceForeign8": {
                "type": "number"
              },
              "quantity1": {
                "type": "integer"
              },
              "quantity2": {
                "type": "integer"
              },
              "quantity3": {
                "type": "integer"
              },
              "quantity4": {
                "type": "integer"
              },
              "quantity5": {
                "type": "integer"
              },
              "quantity6": {
                "type": "integer"
              },
              "quantity7": {
                "type": "integer"
              },
              "quantity8": {
                "type": "integer"
              },
              "revision": {
                "type": "string"
              },
              "status": {
                "type": "string"
              },
              "uniqueID": {
                "type": "integer"
              },
              "unit1": {
                "type": "string"
              },
              "unit2": {
                "type": "string"
              },
              "unit3": {
                "type": "string"
              },
              "unit4": {
                "type": "string"
              },
              "unit5": {
                "type": "string"
              },
              "unit6": {
                "type": "string"
              },
              "unit7": {
                "type": "string"
              },
              "unit8": {
                "type": "string"
              },
              "user_Currency1": {
                "type": "number"
              },
              "user_Currency2": {
                "type": "number"
              },
              "user_Date1": {
                "type": "string"
              },
              "user_Date2": {
                "type": "string"
              },
              "user_Memo1": {
                "type": "string"
              },
              "user_Number1": {
                "type": "number"
              },
              "user_Number2": {
                "type": "number"
              },
              "user_Number3": {
                "type": "number"
              },
              "user_Number4": {
                "type": "number"
              },
              "user_Text1": {
                "type": "string"
              },
              "user_Text2": {
                "type": "string"
              },
              "user_Text3": {
                "type": "string"
              },
              "user_Text4": {
                "type": "string"
              },
              "workCode": {
                "type": "string"
              }
            }
          }
        },
        "address1": {
          "type": "string"
        },
        "city": {
          "type": "string"
        },
        "contactName": {
          "type": "string"
        },
        "country": {
          "type": "string"
        },
        "currencyCode": {
          "type": "string"
        },
        "customerCode": {
          "type": "string"
        },
        "customerName": {
          "type": "string"
        },
        "dateEntered": {
          "type": "string"
        },
        "exchangeRate": {
          "type": "number"
        },
        "expireDate": {
          "type": "string"
        },
        "fax": {
          "type": "string"
        },
        "followUpDate": {
          "type": "string"
        },
        "GSTCode": {
          "type": "string"
        },
        "inquiryNumber": {
          "type": "string"
        },
        "isFreeFormCustomer": {
          "type": "boolean"
        },
        "location": {
          "type": "string"
        },
        "notes": {
          "type": "string"
        },
        "phone": {
          "type": "string"
        },
        "quotedBy": {
          "type": "string"
        },
        "salesID": {
          "type": "string"
        },
        "shippingCode": {
          "type": "string"
        },
        "shipToName": {
          "type": "string"
        },
        "shipVia": {
          "type": "string"
        },
        "state": {
          "type": "string"
        },
        "taxCode": {
          "type": "string"
        },
        "termsCode": {
          "type": "string"
        },
        "territory": {
          "type": "string"
        },
        "user_Currency1": {
          "type": "number"
        },
        "user_Currency2": {
          "type": "number"
        },
        "user_Date1": {
          "type": "string"
        },
        "user_Date2": {
          "type": "string"
        },
        "user_Memo1": {
          "type": "string"
        },
        "user_Number1": {
          "type": "number"
        },
        "user_Number2": {
          "type": "number"
        },
        "payload": {
          "type": "object",
          "description": "(payload trimmed \u2013 see API docs for full schema)",
          "properties": {}
        }
      },
      "required": [
        "quoteNumber"
      ]
    },
    "method": "patch",
    "path": "/api/v1/quotes/{quoteNumber}"
  },
  {
    "name": "get_api_v1_reason_codes",
    "description": "By default a reason code response will include only the fields: active, createRMA, description, lastModDate, lastModUser, reasonCode, reasonCodeID, uniqueID. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/reason-codes"
  },
  {
    "name": "get_api_v1_reason_codes__uniqueID_",
    "description": "By default a reason code response will include only the fields: active, createRMA, description, lastModDate, lastModUser, reasonCode, reasonCodeID, uniqueID. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "uniqueID": {
          "type": "string"
        },
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        }
      },
      "required": [
        "uniqueID"
      ]
    },
    "method": "get",
    "path": "/api/v1/reason-codes/{uniqueID}"
  },
  {
    "name": "post_api_v1_orders_orderNumber_order_line_items_itemNumbe_3a5d16",
    "description": "Creates a Order Release",
    "parameters": {
      "type": "object",
      "properties": {
        "binLocation": {
          "type": "string"
        },
        "comments": {
          "type": "string"
        },
        "deliveryType": {
          "type": "integer"
        },
        "dueDate": {
          "type": "string"
        },
        "EDISoftItemNumber": {
          "type": "integer"
        },
        "lastModDate": {
          "type": "string"
        },
        "lastModUser": {
          "type": "string"
        },
        "lotNumber": {
          "type": "string"
        },
        "quantity": {
          "type": "integer"
        },
        "orderNumber": {
          "type": "string"
        },
        "itemNumber": {
          "type": "string"
        }
      },
      "required": [
        "quantity",
        "orderNumber",
        "itemNumber"
      ]
    },
    "method": "post",
    "path": "/api/v1/orders/{orderNumber}/order-line-items/{itemNumber}/releases"
  },
  {
    "name": "get_api_v1_orders_orderNumber_order_line_items_itemNumber_b2b25f",
    "description": "By default a release response will include only the fields: binLocation, comments, dateComplete, deliveryTicketNumber, deliveryType, destinationJobNumber, dueDate, itemNumber, jobNumber, lastModDate, lotNumber, manufacturingJobNumber, orderNumber, partDescription, partNumber, quantity, uniqueID. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "orderNumber": {
          "type": "string"
        },
        "itemNumber": {
          "type": "string"
        },
        "uniqueID": {
          "type": "string"
        },
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        }
      },
      "required": [
        "orderNumber",
        "itemNumber",
        "uniqueID"
      ]
    },
    "method": "get",
    "path": "/api/v1/orders/{orderNumber}/order-line-items/{itemNumber}/releases/{uniqueID}"
  },
  {
    "name": "get_api_v1_releases",
    "description": "By default a release response will include only the fields: binLocation, comments, dateComplete, deliveryTicketNumber, deliveryType, destinationJobNumber, dueDate, itemNumber, jobNumber, lastModDate, lotNumber, manufacturingJobNumber, orderNumber, partDescription, partNumber, quantity, uniqueID. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/releases"
  },
  {
    "name": "get_api_v1_estimates__partNumber__routings__stepNumber_",
    "description": "By default a Routing response will include only the fields: partNumber, stepNumber, workOrVendor, workCenter, vendorCode, operatorCode, description, setupTime, timeUnit, cycleTime, cycleUnit, machineRun, teamSize, scrapPercent, laborAccount, setupRate, cycleRate, burdenRate, laborRate, isUnattendedOperation, leadTime, markupPercent, isCertificationRequired, GLAccount, cost1, unit1, setup1, setupPrice, cyclePrice, total, estimQuantity, actualPiecesGood, actualPiecesScrapped, ignoreVendorMinimum, numberMachineForJob, uniqueID, lastModDate. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "partNumber": {
          "type": "string"
        },
        "stepNumber": {
          "type": "string"
        },
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        }
      },
      "required": [
        "partNumber",
        "stepNumber"
      ]
    },
    "method": "get",
    "path": "/api/v1/estimates/{partNumber}/routings/{stepNumber}"
  },
  {
    "name": "get_api_v1_routings",
    "description": "By default a routing response will include only the fields: partNumber, stepNumber, workOrVendor, workCenter, vendorCode, operatorCode, description, setupTime, timeUnit, cycleTime, cycleUnit, machineRun, teamSize, scrapPercent, laborAccount, setupRate, cycleRate, burdenRate, laborRate, isUnattendedOperation, leadTime, markupPercent, isCertificationRequired, GLAccount, cost1, unit1, setup1, setupPrice, cyclePrice, total, estimQuantity, actualPiecesGood, actualPiecesScrapped, ignoreVendorMinimum, numberMachineForJob, uniqueID, lastModDate. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/routings"
  },
  {
    "name": "get_api_v1_salespersons",
    "description": "By default a salesperson response will include only the fields: active, address1, city, commissionAccount, commissionPercent, country, lastModDate, lastModUser, name, phone, salesID, state, uniqueID, YTDCommission, YTDSales, zipCode. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/salespersons"
  },
  {
    "name": "patch_api_v1_salespersons__salesID_",
    "description": "Updates a Salesperson",
    "parameters": {
      "type": "object",
      "properties": {
        "active": {
          "type": "boolean"
        },
        "address1": {
          "type": "string"
        },
        "city": {
          "type": "string"
        },
        "commissionAccount": {
          "type": "string"
        },
        "commissionPercent": {
          "type": "number"
        },
        "country": {
          "type": "string"
        },
        "name": {
          "type": "string"
        },
        "phone": {
          "type": "string"
        },
        "state": {
          "type": "string"
        },
        "zipCode": {
          "type": "string"
        },
        "salesID": {
          "type": "string"
        }
      },
      "required": [
        "salesID"
      ]
    },
    "method": "patch",
    "path": "/api/v1/salespersons/{salesID}"
  },
  {
    "name": "get_api_v1_shipping_addresses",
    "description": "By default a Shipping response will include only the fields: customerCode, FOB, LastModDate, LastModUser, location, printCertification, shippingAddress1, shippingCity, shippingCountry, shippingCode, shippingContact, shippingFAX, shippingPhone, uniqueID, shipToName, shipVia, shippingState, shippingZipCode, territory. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/shipping-addresses"
  },
  {
    "name": "post_api_v1_shipping_addresses",
    "description": "Creates a Shipping Address",
    "parameters": {
      "type": "object",
      "properties": {
        "customerCode": {
          "type": "string"
        },
        "location": {
          "type": "string"
        },
        "printCertification": {
          "type": "boolean"
        },
        "shippingAddress1": {
          "type": "string"
        },
        "shippingCity": {
          "type": "string"
        },
        "shippingCode": {
          "type": "string"
        },
        "shippingContact": {
          "type": "string"
        },
        "shippingCountry": {
          "type": "string"
        },
        "shippingFAX": {
          "type": "string"
        },
        "shippingPhone": {
          "type": "string"
        },
        "shippingState": {
          "type": "string"
        },
        "shippingZipCode": {
          "type": "string"
        },
        "shipToName": {
          "type": "string"
        },
        "shipVia": {
          "type": "string"
        },
        "territory": {
          "type": "string"
        }
      },
      "required": [
        "customerCode",
        "location"
      ]
    },
    "method": "post",
    "path": "/api/v1/shipping-addresses"
  },
  {
    "name": "get_api_v1_shipping_addresses__customerCode___location_",
    "description": "By default a Shipping response will include only the fields: customerCode, FOB, LastModDate, LastModUser, location, printCertification, shippingAddress1, shippingCity, shippingCountry, shippingCode, shippingContact, shippingFAX, shippingPhone, uniqueID, shipToName, shipVia, shippingState, shippingZipCode, territory. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "customerCode": {
          "type": "string"
        },
        "location": {
          "type": "string"
        },
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        }
      },
      "required": [
        "customerCode",
        "location"
      ]
    },
    "method": "get",
    "path": "/api/v1/shipping-addresses/{customerCode}/{location}"
  },
  {
    "name": "patch_api_v1_shipping_addresses__customerCode___location_",
    "description": "Updates a Shipping Address",
    "parameters": {
      "type": "object",
      "properties": {
        "location": {
          "type": "string"
        },
        "printCertification": {
          "type": "boolean"
        },
        "shippingAddress1": {
          "type": "string"
        },
        "shippingCity": {
          "type": "string"
        },
        "shippingContact": {
          "type": "string"
        },
        "shippingCountry": {
          "type": "string"
        },
        "shippingFAX": {
          "type": "string"
        },
        "shippingPhone": {
          "type": "string"
        },
        "shippingState": {
          "type": "string"
        },
        "shippingZipCode": {
          "type": "string"
        },
        "shipToName": {
          "type": "string"
        },
        "shipVia": {
          "type": "string"
        },
        "territory": {
          "type": "string"
        },
        "customerCode": {
          "type": "string"
        }
      },
      "required": [
        "customerCode",
        "location"
      ]
    },
    "method": "patch",
    "path": "/api/v1/shipping-addresses/{customerCode}/{location}"
  },
  {
    "name": "get_api_v1_tax_codes",
    "description": "By default an order response will include only the fields: accountingID, active, allAreTaxable, description, lastModDate, lastModUser, taxGLCode, taxAccount1, taxAccount10, taxAccount2, taxAccount3, taxAccount4, taxAccount5, taxAccount6, taxAccount7, taxAccount8, taxAccount9, taxCode, uniqueID, taxFactor. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/tax-codes"
  },
  {
    "name": "get_api_v1_tax_codes__taxCode_",
    "description": "By default an order response will include only the fields: accountingID, active, allAreTaxable, description, lastModDate, lastModUser, taxGLCode, taxAccount1, taxAccount10, taxAccount2, taxAccount3, taxAccount4, taxAccount5, taxAccount6, taxAccount7, taxAccount8, taxAccount9, taxCode, uniqueID, taxFactor. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "taxCode": {
          "type": "string"
        },
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        }
      },
      "required": [
        "taxCode"
      ]
    },
    "method": "get",
    "path": "/api/v1/tax-codes/{taxCode}"
  },
  {
    "name": "get_api_v1_terms",
    "description": "By default a term code response will include only the fields: accountingID, description, discountDays, discountPercent, lastModDate, lastModUser, latePercent, method, netDueDays, uniqueID, termsCode. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/terms"
  },
  {
    "name": "get_api_v1_terms__termsCode_",
    "description": "By default a term code response will include only the fields: accountingID, description, discountDays, discountPercent, lastModDate, lastModUser, latePercent, method, netDueDays, uniqueID, termsCode. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "termsCode": {
          "type": "string"
        },
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        }
      },
      "required": [
        "termsCode"
      ]
    },
    "method": "get",
    "path": "/api/v1/terms/{termsCode}"
  },
  {
    "name": "get_api_v1_time_ticket_details",
    "description": "By default a time ticket detail response will include only the fields: actualPayRate, billingRate, comments, cycleTime, employeeCode, employeeName, jobNumber, machineHours, machinesRun, manHours, numberMachinesForJob, onlineID, operationNumber, payrollRate, piecesFinished, piecesScrapped, setupTime, shift, stepNumber, ticketDate, timeTicketGUID, uniqueID, workCenter. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/time-ticket-details"
  },
  {
    "name": "post_api_v1_time_ticket_details",
    "description": "Creates a Time Ticket Detail",
    "parameters": {
      "type": "object",
      "properties": {
        "allowClosedJobs": {
          "type": "boolean"
        },
        "billingRate": {
          "type": "integer"
        },
        "comments": {
          "type": "string"
        },
        "cycleTime": {
          "type": "number"
        },
        "employeeCode": {
          "type": "integer"
        },
        "jobNumber": {
          "type": "string"
        },
        "machinesRun": {
          "type": "integer"
        },
        "numberMachinesForJob": {
          "type": "number"
        },
        "operationNumber": {
          "type": "integer"
        },
        "overTime": {
          "type": "boolean"
        },
        "payrollRate": {
          "type": "integer"
        },
        "piecesFinished": {
          "type": "number"
        },
        "piecesScrapped": {
          "type": "number"
        },
        "reasonNumber": {
          "type": "number"
        },
        "setupTime": {
          "type": "number"
        },
        "shift": {
          "type": "integer"
        },
        "stepNumber": {
          "type": "integer"
        },
        "ticketDate": {
          "type": "string"
        },
        "timeEnd": {
          "type": "string"
        },
        "timeStart": {
          "type": "string"
        },
        "unattendedOperation": {
          "type": "boolean"
        },
        "workCenter": {
          "type": "integer"
        }
      },
      "required": [
        "employeeCode",
        "jobNumber",
        "ticketDate"
      ]
    },
    "method": "post",
    "path": "/api/v1/time-ticket-details"
  },
  {
    "name": "get_api_v1_time_ticket_details__timeTicketGUID_",
    "description": "By default a time ticket detail response will include only the fields: actualPayRate, billingRate, comments, cycleTime, employeeCode, employeeName, jobNumber, machineHours, machinesRun, manHours, numberMachinesForJob, onlineID, operationNumber, payrollRate, piecesFinished, piecesScrapped, setupTime, shift, stepNumber, ticketDate, timeTicketGUID, uniqueID, workCenter. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "timeTicketGUID": {
          "type": "string"
        },
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        }
      },
      "required": [
        "timeTicketGUID"
      ]
    },
    "method": "get",
    "path": "/api/v1/time-ticket-details/{timeTicketGUID}"
  },
  {
    "name": "patch_api_v1_time_ticket_details__timeTicketGUID_",
    "description": "Updates a Time Ticket Detail",
    "parameters": {
      "type": "object",
      "properties": {
        "allowClosedJobs": {
          "type": "boolean"
        },
        "billingRate": {
          "type": "integer"
        },
        "comments": {
          "type": "string"
        },
        "cycleTime": {
          "type": "number"
        },
        "jobNumber": {
          "type": "string"
        },
        "machinesRun": {
          "type": "integer"
        },
        "numberMachinesForJob": {
          "type": "number"
        },
        "operationNumber": {
          "type": "integer"
        },
        "overTime": {
          "type": "boolean"
        },
        "payrollRate": {
          "type": "integer"
        },
        "piecesFinished": {
          "type": "number"
        },
        "piecesScrapped": {
          "type": "number"
        },
        "reasonNumber": {
          "type": "number"
        },
        "setupTime": {
          "type": "number"
        },
        "shift": {
          "type": "integer"
        },
        "stepNumber": {
          "type": "integer"
        },
        "timeEnd": {
          "type": "string"
        },
        "timeStart": {
          "type": "string"
        },
        "unattendedOperation": {
          "type": "boolean"
        },
        "workCenter": {
          "type": "integer"
        },
        "timeTicketGUID": {
          "type": "string"
        }
      },
      "required": [
        "timeTicketGUID"
      ]
    },
    "method": "patch",
    "path": "/api/v1/time-ticket-details/{timeTicketGUID}"
  },
  {
    "name": "get_api_v1_time_tickets",
    "description": "By default a time ticket response will include only the fields: employeeCode, employeeName, enteredBy, enteredDate, lastModDate, lastModUser, searchDate, ticketDate, uniqueID. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/time-tickets"
  },
  {
    "name": "post_api_v1_time_tickets",
    "description": "Creates a Time Ticket",
    "parameters": {
      "type": "object",
      "properties": {
        "timeTicketDetails": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "billingRate": {
                "type": "integer"
              },
              "comments": {
                "type": "string"
              },
              "cycleTime": {
                "type": "number"
              },
              "jobNumber": {
                "type": "string"
              },
              "machinesRun": {
                "type": "integer"
              },
              "numberMachinesForJob": {
                "type": "number"
              },
              "operationNumber": {
                "type": "integer"
              },
              "overTime": {
                "type": "boolean"
              },
              "payrollRate": {
                "type": "integer"
              },
              "piecesFinished": {
                "type": "number"
              },
              "piecesScrapped": {
                "type": "number"
              },
              "reasonNumber": {
                "type": "number"
              },
              "setupTime": {
                "type": "number"
              },
              "shift": {
                "type": "integer"
              },
              "stepNumber": {
                "type": "integer"
              },
              "timeEnd": {
                "type": "string"
              },
              "timeStart": {
                "type": "string"
              },
              "unattendedOperation": {
                "type": "boolean"
              },
              "workCenter": {
                "type": "integer"
              }
            },
            "required": [
              "jobNumber"
            ]
          }
        },
        "allowClosedJobs": {
          "type": "boolean"
        },
        "employeeCode": {
          "type": "integer"
        },
        "ticketDate": {
          "type": "string"
        }
      },
      "required": [
        "employeeCode",
        "ticketDate"
      ]
    },
    "method": "post",
    "path": "/api/v1/time-tickets"
  },
  {
    "name": "get_api_v1_time_tickets__ticketDate__employees__employeeCode_",
    "description": "By default a time ticket response will include only the fields: employeeCode, employeeName, enteredBy, enteredDate, lastModDate, lastModUser, searchDate, ticketDate, uniqueID. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "ticketDate": {
          "type": "string"
        },
        "employeeCode": {
          "type": "string"
        },
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        }
      },
      "required": [
        "ticketDate",
        "employeeCode"
      ]
    },
    "method": "get",
    "path": "/api/v1/time-tickets/{ticketDate}/employees/{employeeCode}"
  },
  {
    "name": "patch_api_v1_time_tickets__ticketDate__employees__employeeCode_",
    "description": "Updates a time ticket",
    "parameters": {
      "type": "object",
      "properties": {
        "timeTicketDetails": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "timeTicketGUID": {
                "type": "string"
              },
              "allowClosedJobs": {
                "type": "boolean"
              },
              "billingRate": {
                "type": "integer"
              },
              "comments": {
                "type": "string"
              },
              "cycleTime": {
                "type": "number"
              },
              "jobNumber": {
                "type": "string"
              },
              "machinesRun": {
                "type": "integer"
              },
              "numberMachinesForJob": {
                "type": "number"
              },
              "operationNumber": {
                "type": "integer"
              },
              "overTime": {
                "type": "boolean"
              },
              "payrollRate": {
                "type": "integer"
              },
              "piecesFinished": {
                "type": "number"
              },
              "piecesScrapped": {
                "type": "number"
              },
              "reasonNumber": {
                "type": "number"
              },
              "setupTime": {
                "type": "number"
              },
              "shift": {
                "type": "integer"
              },
              "stepNumber": {
                "type": "integer"
              },
              "timeEnd": {
                "type": "string"
              },
              "timeStart": {
                "type": "string"
              },
              "unattendedOperation": {
                "type": "boolean"
              },
              "workCenter": {
                "type": "integer"
              }
            }
          }
        },
        "ticketDate": {
          "type": "string"
        },
        "employeeCode": {
          "type": "string"
        }
      },
      "required": [
        "ticketDate",
        "employeeCode"
      ]
    },
    "method": "patch",
    "path": "/api/v1/time-tickets/{ticketDate}/employees/{employeeCode}"
  },
  {
    "name": "get_api_v1_tooling_maintenance",
    "description": "By default a tooling maintenance response will include only the fields: completed, cost, description, employeeCode, endDate, invoiceNumber, jobNumber, lastModDate, lastModUser, partDescription, partNumber, startDate, toolingCode, uniqueID, vendorCode. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/tooling-maintenance"
  },
  {
    "name": "get_api_v1_user_labels",
    "description": "By default a user label response will include only the fields: area, currency1, currency2, date1, date2, lastModDate, memo1, number1, number2, number3, number4, text1, text2, text3, text4, uniqueID. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/user-labels"
  },
  {
    "name": "get_api_v1_user_transactions",
    "description": "By default a user transaction response will include only the fields: action, comments, object, transactionDate, uniqueID, userID, value, value2. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/user-transactions"
  },
  {
    "name": "get_api_v1_vendor_returns",
    "description": "By default a vendor return response will include only the fields: billUsForReturn, comment, correctiveActionCode, correctiveActionNumber, createCAR, createCreditMemo, createdVendorInvoiceNo, createNC, creditDate, creditedBy, dateEntered, debitPrinted, enteredBy, inspectedBy, inspectionDate, issueDate, issuedBy, labelPrinted, lastModDate, lastModUser, PODate, purchasedBy, QCComment, reasonForReturn, receiveDate, receivedBy, receiverNumber, receivingComment, status, vendorCode, vendorDescription, uniqueID, vendorReturnNumber, vendorRMANumber. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/vendor-returns"
  },
  {
    "name": "get_api_v1_vendor_returns_line_items",
    "description": "By default a vendor return line item response will include only the fields: correctiveActionNumber, createCAR, createNC, description, jobNumber, lastModDate, lastModUser, nonConfNumber, originalQuantityReceived, partDescription, partNumber, POItemNumber, PONumber, quantityGood, quantityReturned, quantityToCancel, quantityToReject, reasonCode, receiverNumber, receiverItemNumber, restockingPercent, status, stepNumber, unit, uniqueID, vendorReturnNumber, vendorReturnItemNumber. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/vendor-returns-line-items"
  },
  {
    "name": "get_api_v1_vendor_returns_releases",
    "description": "By default a vendor return release response will include only the fields: comments, jobNumber, lastModDate, lastModUser, POReleaseUniqueId, quantityToCancel, quantityToReject, releaseQuantity, vendReturnItemNumber, vendReturnNumber, uniqueID. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/vendor-returns-releases"
  },
  {
    "name": "get_api_v1_vendors",
    "description": "By default a vendor response will include only the fields: active, comments2, currencyCode, enteredDate, federalIDNumber, GLAccount1, lastModDate, leadTime, termsCode, uniqueID, vendorAccountNumber, vendorCode, vendorName, vendorType. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/vendors"
  },
  {
    "name": "post_api_v1_vendors",
    "description": "Creates a Vendor",
    "parameters": {
      "type": "object",
      "properties": {
        "active": {
          "type": "boolean"
        },
        "comments1": {
          "type": "string"
        },
        "comments2": {
          "type": "string"
        },
        "currencyCode": {
          "type": "string"
        },
        "defaultEmployeeCode": {
          "type": "string"
        },
        "FAX": {
          "type": "string"
        },
        "federalIDNumber": {
          "type": "string"
        },
        "form1099Vendor": {
          "type": "boolean"
        },
        "GLAccount1": {
          "type": "string"
        },
        "GSTCode": {
          "type": "string"
        },
        "leadTime": {
          "type": "integer"
        },
        "markup": {
          "type": "number"
        },
        "minimumOrder": {
          "type": "number"
        },
        "outsideService": {
          "type": "boolean"
        },
        "phone": {
          "type": "string"
        },
        "purchasingAddress1": {
          "type": "string"
        },
        "purchasingCity": {
          "type": "string"
        },
        "purchasingContact": {
          "type": "string"
        },
        "purchasingCountry": {
          "type": "string"
        },
        "purchasingPhone": {
          "type": "string"
        },
        "purchasingState": {
          "type": "string"
        },
        "purchasingZipCode": {
          "type": "string"
        },
        "QBVendorCode": {
          "type": "string"
        },
        "remittanceAddress1": {
          "type": "string"
        },
        "remittanceCity": {
          "type": "string"
        },
        "remittanceCountry": {
          "type": "string"
        },
        "remittanceState": {
          "type": "string"
        },
        "remittanceZipCode": {
          "type": "string"
        },
        "restockingPercent": {
          "type": "number"
        },
        "salesTaxCode": {
          "type": "string"
        },
        "setupCharge": {
          "type": "number"
        },
        "shipCode": {
          "type": "string"
        },
        "shippingAddress1": {
          "type": "string"
        },
        "shippingCity": {
          "type": "string"
        },
        "shippingCountry": {
          "type": "string"
        },
        "shippingState": {
          "type": "string"
        },
        "shippingZipCode": {
          "type": "string"
        },
        "shipVia": {
          "type": "string"
        },
        "termsCode": {
          "type": "string"
        },
        "user_Currency1": {
          "type": "number"
        },
        "user_Currency2": {
          "type": "number"
        },
        "user_Date1": {
          "type": "string"
        },
        "user_Date2": {
          "type": "string"
        },
        "user_Memo1": {
          "type": "string"
        },
        "user_Number1": {
          "type": "number"
        },
        "user_Number2": {
          "type": "number"
        },
        "user_Number3": {
          "type": "number"
        },
        "user_Number4": {
          "type": "number"
        },
        "user_Text1": {
          "type": "string"
        },
        "user_Text2": {
          "type": "string"
        },
        "user_Text3": {
          "type": "string"
        },
        "user_Text4": {
          "type": "string"
        },
        "vendorAccountNumber": {
          "type": "string"
        },
        "vendorCode": {
          "type": "string"
        },
        "vendorName": {
          "type": "string"
        },
        "vendorType": {
          "type": "string"
        },
        "website": {
          "type": "string"
        }
      },
      "required": [
        "currencyCode",
        "vendorCode",
        "vendorName"
      ]
    },
    "method": "post",
    "path": "/api/v1/vendors"
  },
  {
    "name": "get_api_v1_vendors__vendorCode_",
    "description": "By default a vendor response will include only the fields: active, comments2, currencyCode, enteredDate, federalIDNumber, GLAccount1, lastModDate, leadTime, termsCode, uniqueID, vendorAccountNumber, vendorCode, vendorName, vendorType. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "vendorCode": {
          "type": "string"
        },
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        }
      },
      "required": [
        "vendorCode"
      ]
    },
    "method": "get",
    "path": "/api/v1/vendors/{vendorCode}"
  },
  {
    "name": "patch_api_v1_vendors__vendorCode_",
    "description": "Updates a Vendor",
    "parameters": {
      "type": "object",
      "properties": {
        "active": {
          "type": "boolean"
        },
        "comments1": {
          "type": "string"
        },
        "comments2": {
          "type": "string"
        },
        "currencyCode": {
          "type": "string"
        },
        "defaultEmployeeCode": {
          "type": "string"
        },
        "federalIDNumber": {
          "type": "string"
        },
        "form1099Vendor": {
          "type": "boolean"
        },
        "GLAccount1": {
          "type": "string"
        },
        "GSTCode": {
          "type": "string"
        },
        "leadTime": {
          "type": "integer"
        },
        "markup": {
          "type": "number"
        },
        "outsideService": {
          "type": "boolean"
        },
        "purchasingAddress1": {
          "type": "string"
        },
        "purchasingCity": {
          "type": "string"
        },
        "purchasingContact": {
          "type": "string"
        },
        "purchasingCountry": {
          "type": "string"
        },
        "purchasingPhone": {
          "type": "string"
        },
        "purchasingState": {
          "type": "string"
        },
        "purchasingZipCode": {
          "type": "string"
        },
        "remittanceAddress1": {
          "type": "string"
        },
        "remittanceCity": {
          "type": "string"
        },
        "remittanceCountry": {
          "type": "string"
        },
        "remittanceState": {
          "type": "string"
        },
        "remittanceZipCode": {
          "type": "string"
        },
        "restockingPercent": {
          "type": "number"
        },
        "salesTaxCode": {
          "type": "string"
        },
        "setupCharge": {
          "type": "number"
        },
        "shipCode": {
          "type": "string"
        },
        "shippingAddress1": {
          "type": "string"
        },
        "shippingCity": {
          "type": "string"
        },
        "shippingCountry": {
          "type": "string"
        },
        "shippingState": {
          "type": "string"
        },
        "shippingZipCode": {
          "type": "string"
        },
        "shipVia": {
          "type": "string"
        },
        "user_Currency1": {
          "type": "number"
        },
        "user_Currency2": {
          "type": "number"
        },
        "user_Date1": {
          "type": "string"
        },
        "user_Date2": {
          "type": "string"
        },
        "user_Memo1": {
          "type": "string"
        },
        "user_Number1": {
          "type": "number"
        },
        "user_Number2": {
          "type": "number"
        },
        "user_Number3": {
          "type": "number"
        },
        "user_Number4": {
          "type": "number"
        },
        "user_Text1": {
          "type": "string"
        },
        "user_Text2": {
          "type": "string"
        },
        "user_Text3": {
          "type": "string"
        },
        "user_Text4": {
          "type": "string"
        },
        "vendorAccountNumber": {
          "type": "string"
        },
        "vendorName": {
          "type": "string"
        },
        "vendorType": {
          "type": "string"
        },
        "website": {
          "type": "string"
        },
        "vendorCode": {
          "type": "string"
        }
      },
      "required": [
        "vendorCode"
      ]
    },
    "method": "patch",
    "path": "/api/v1/vendors/{vendorCode}"
  },
  {
    "name": "get_api_v1_work_center_maintenance",
    "description": "By default a Work Center maintenance response will include only the fields: completed, cost, description, employeeCode, endDate, invoiceNumber, jobNumber, lastModDate, lastModUser, startDate, vendorCode, wcMaintCode, uniqueID, workCenter, workCenterName. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/work-center-maintenance"
  },
  {
    "name": "get_api_v1_work_centers",
    "description": "By default a work center response will include only the fields: active, attendanceCode, burdenRate, capacityFactor, comments, departmentNumber, description, laborAccount, laborRate, lastModDate, operationCode, queueTime, queueUnit, shortName, uniqueID, workCenter. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        },
        "sort": {
          "type": "string",
          "description": "A comma separated list of field to sort by. See the <a href='#sort-expressions'>Sort Expressions</a> section for more information."
        },
        "filters": {
          "type": "object",
          "properties": {},
          "description": "Filters must be provided as query string parameters as defined in the <a href='#filter-expressions'>Filter Expressions</a> section."
        },
        "skip": {
          "type": "string",
          "description": "The number of records at the start of the result set to skip over."
        },
        "take": {
          "type": "string",
          "description": "The number of records to retrieve."
        }
      }
    },
    "method": "get",
    "path": "/api/v1/work-centers"
  },
  {
    "name": "post_api_v1_work_centers",
    "description": "Creates a Work Center",
    "parameters": {
      "type": "object",
      "properties": {
        "active": {
          "type": "boolean"
        },
        "attendanceCode": {
          "type": "string"
        },
        "burdenRate": {
          "type": "number"
        },
        "capacityFactor": {
          "type": "number"
        },
        "cycle1": {
          "type": "number"
        },
        "cycle10": {
          "type": "number"
        },
        "cycle2": {
          "type": "number"
        },
        "cycle3": {
          "type": "number"
        },
        "cycle4": {
          "type": "number"
        },
        "cycle5": {
          "type": "number"
        },
        "cycle6": {
          "type": "number"
        },
        "cycle7": {
          "type": "number"
        },
        "cycle8": {
          "type": "number"
        },
        "cycle9": {
          "type": "number"
        },
        "departmentNumber": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "laborAccount": {
          "type": "string"
        },
        "laborRate": {
          "type": "number"
        },
        "operationCode": {
          "type": "string"
        },
        "setup1": {
          "type": "number"
        },
        "setup10": {
          "type": "number"
        },
        "setup2": {
          "type": "number"
        },
        "setup3": {
          "type": "number"
        },
        "setup4": {
          "type": "number"
        },
        "setup5": {
          "type": "number"
        },
        "setup6": {
          "type": "number"
        },
        "setup7": {
          "type": "number"
        },
        "setup8": {
          "type": "number"
        },
        "setup9": {
          "type": "number"
        },
        "shortName": {
          "type": "string"
        },
        "user_Currency1": {
          "type": "number"
        },
        "user_Currency2": {
          "type": "number"
        },
        "user_Date1": {
          "type": "string"
        },
        "user_Date2": {
          "type": "string"
        },
        "user_Memo1": {
          "type": "string"
        },
        "user_Number1": {
          "type": "number"
        },
        "user_Number2": {
          "type": "number"
        },
        "user_Number3": {
          "type": "number"
        },
        "user_Number4": {
          "type": "number"
        },
        "user_Text1": {
          "type": "string"
        },
        "user_Text2": {
          "type": "string"
        },
        "user_Text3": {
          "type": "string"
        },
        "user_Text4": {
          "type": "string"
        },
        "workCenter": {
          "type": "integer"
        }
      },
      "required": [
        "shortName"
      ]
    },
    "method": "post",
    "path": "/api/v1/work-centers"
  },
  {
    "name": "get_api_v1_work_centers__workCenter_",
    "description": "By default a work center response will include only the fields: active, attendanceCode, burdenRate, capacityFactor, comments, departmentNumber, description, laborAccount, laborRate, lastModDate, operationCode, queueTime, queueUnit, shortName, uniqueID, workCenter. You may specify the exact fields to return using the fields parameter.",
    "parameters": {
      "type": "object",
      "properties": {
        "workCenter": {
          "type": "string"
        },
        "fields": {
          "type": "string",
          "description": "A comma separated list of fields to include in the result."
        }
      },
      "required": [
        "workCenter"
      ]
    },
    "method": "get",
    "path": "/api/v1/work-centers/{workCenter}"
  },
  {
    "name": "patch_api_v1_work_centers__workCenter_",
    "description": "Updates a Work Center",
    "parameters": {
      "type": "object",
      "properties": {
        "active": {
          "type": "boolean"
        },
        "attendanceCode": {
          "type": "string"
        },
        "burdenRate": {
          "type": "number"
        },
        "cycle1": {
          "type": "number"
        },
        "cycle10": {
          "type": "number"
        },
        "cycle2": {
          "type": "number"
        },
        "cycle3": {
          "type": "number"
        },
        "cycle4": {
          "type": "number"
        },
        "cycle5": {
          "type": "number"
        },
        "cycle6": {
          "type": "number"
        },
        "cycle7": {
          "type": "number"
        },
        "cycle8": {
          "type": "number"
        },
        "cycle9": {
          "type": "number"
        },
        "departmentNumber": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "laborAccount": {
          "type": "string"
        },
        "laborRate": {
          "type": "number"
        },
        "operationCode": {
          "type": "string"
        },
        "setup1": {
          "type": "number"
        },
        "setup10": {
          "type": "number"
        },
        "setup2": {
          "type": "number"
        },
        "setup3": {
          "type": "number"
        },
        "setup4": {
          "type": "number"
        },
        "setup5": {
          "type": "number"
        },
        "setup6": {
          "type": "number"
        },
        "setup7": {
          "type": "number"
        },
        "setup8": {
          "type": "number"
        },
        "setup9": {
          "type": "number"
        },
        "user_Currency1": {
          "type": "number"
        },
        "user_Currency2": {
          "type": "number"
        },
        "user_Date1": {
          "type": "string"
        },
        "user_Date2": {
          "type": "string"
        },
        "user_Memo1": {
          "type": "string"
        },
        "user_Number1": {
          "type": "number"
        },
        "user_Number2": {
          "type": "number"
        },
        "user_Number3": {
          "type": "number"
        },
        "user_Number4": {
          "type": "number"
        },
        "user_Text1": {
          "type": "string"
        },
        "user_Text2": {
          "type": "string"
        },
        "user_Text3": {
          "type": "string"
        },
        "user_Text4": {
          "type": "string"
        },
        "workCenter": {
          "type": "string"
        }
      },
      "required": [
        "workCenter"
      ]
    },
    "method": "patch",
    "path": "/api/v1/work-centers/{workCenter}"
  }
]
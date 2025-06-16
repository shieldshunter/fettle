export const JOBBOSS_PARTS_FUNCTIONS = [
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
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
    }
  }
] as const;
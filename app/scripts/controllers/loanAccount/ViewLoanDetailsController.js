(function (module) {
    mifosX.controllers = _.extend(module, {
        ViewLoanDetailsController: function (scope, routeParams, resourceFactory, location, route, http, $modal, dateFilter, API_VERSION, $sce, $rootScope) {
            scope.loandocuments = [];
            scope.report = false;
            scope.hidePentahoReport = true;
            scope.formData = {};
            scope.date = {};
            scope.date.payDate = new Date();
            scope.routeTo = function (loanId, transactionId, transactionTypeId) {
                if (transactionTypeId == 2 || transactionTypeId == 4) {
                    location.path('/viewloantrxn/' + loanId + '/trxnId/' + transactionId);
                }
                ;
            };
            scope.clickEvent = function (eventName, accountId) {
                eventName = eventName || "";
                switch (eventName) {
                    case "addloancharge":
                        location.path('/addloancharge/' + accountId);
                        break;
                    case "addcollateral":
                        location.path('/addcollateral/' + accountId);
                        break;
                    case "assignloanofficer":
                        location.path('/assignloanofficer/' + accountId);
                        break;
                    case "modifyapplication":
                        location.path('/editloanaccount/' + accountId);
                        break;
                    case "approve":
                        location.path('/loanaccount/' + accountId + '/approve');
                        break;
                    case "reject":
                        location.path('/loanaccount/' + accountId + '/reject');
                        break;
                    case "withdrawnbyclient":
                        location.path('/loanaccount/' + accountId + '/withdrawnByApplicant');
                        break;
                    case "delete":
                        resourceFactory.LoanAccountResource.delete({loanId: accountId}, {}, function (data) {
                            var destination = '/viewgroup/' + data.groupId;
                            if (data.clientId) destination = '/viewclient/' + data.clientId;
                            location.path(destination);
                        });
                        break;
                    case "undoapproval":
                        location.path('/loanaccount/' + accountId + '/undoapproval');
                        break;
                    case "disburse":
                        location.path('/loanaccount/' + accountId + '/disburse');
                        break;
                    case "disbursetosavings":
                        location.path('/loanaccount/' + accountId + '/disbursetosavings');
                        break;
                    case "undodisbursal":
                        location.path('/loanaccount/' + accountId + '/undodisbursal');
                        break;
                    case "makerepayment":
                        location.path('/loanaccount/' + accountId + '/repayment');
                        break;
                    case "waiveinterest":
                        location.path('/loanaccount/' + accountId + '/waiveinterest');
                        break;
                    case "writeoff":
                        location.path('/loanaccount/' + accountId + '/writeoff');
                        break;
                    case "close-rescheduled":
                        location.path('/loanaccount/' + accountId + '/close-rescheduled');
                        break;
                    case "transferFunds":
                        if (scope.loandetails.clientId) {
                            location.path('/accounttransfers/fromloans/' + accountId);
                        }
                        break;
                    case "close":
                        location.path('/loanaccount/' + accountId + '/close');
                        break;
                    case "guarantor":
                        location.path('/guarantor/' + accountId);
                        break;
                    case "unassignloanofficer":
                        location.path('/loanaccount/' + accountId + '/unassignloanofficer');
                        break;
                    case "loanscreenreport":
                        location.path('/loanscreenreport/' + accountId);
                        break;
                }
            };

            scope.delCharge = function (id) {
                $modal.open({
                    templateUrl: 'delcharge.html',
                    controller: DelChargeCtrl,
                    resolve: {
                        ids: function () {
                            return id;
                        }
                    }
                });
            };

            var DelChargeCtrl = function ($scope, $modalInstance, ids) {
                $scope.delete = function () {
                    resourceFactory.LoanAccountResource.delete({loanId: routeParams.id, resourceType: 'charges', chargeId: ids}, {}, function (data) {
                        $modalInstance.close('delete');
                        route.reload();
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            resourceFactory.LoanAccountResource.getLoanAccountDetails({loanId: routeParams.id, associations: 'all'}, function (data) {
                scope.loandetails = data;
                scope.guarantorDetails = data.guarantors;
                scope.date.fromDate = new Date(data.timeline.actualDisbursementDate);
                scope.date.toDate = new Date();
                scope.status = data.status.value;
                scope.chargeAction = data.status.value == "Submitted and pending approval" ? true : false;
                scope.decimals = data.currency.decimalPlaces;
                if (scope.loandetails.charges) {
                    scope.charges = scope.loandetails.charges;
                    for (var i in scope.charges) {
                        if (scope.charges[i].paid || scope.charges[i].waived || scope.charges[i].chargeTimeType.value == 'Disbursement' || scope.loandetails.status.value != 'Active') {
                            var actionFlag = true;
                        }
                        else {
                            var actionFlag = false;
                        }
                        scope.charges[i].actionFlag = actionFlag;
                    }

                    scope.chargeTableShow = true;
                }
                else {
                    scope.chargeTableShow = false;
                }

                if (scope.status == "Submitted and pending approval" || scope.status == "Active" || scope.status == "Approved") {
                    scope.choice = true;
                }
                if (data.status.value == "Submitted and pending approval") {
                    scope.buttons = { singlebuttons: [
                        {
                            name: "button.addloancharge",
                            icon: "icon-plus-sign",
                            taskPermissionName: 'CREATE_LOANCHARGE'
                        },
                        {
                            name: "button.approve",
                            icon: "icon-ok",
                            taskPermissionName: 'APPROVE_LOAN'
                        },
                        {
                            name: "button.modifyapplication",
                            icon: "icon-edit",
                            taskPermissionName: 'UPDATE_LOAN'
                        },
                        {
                            name: "button.reject",
                            icon: "icon-remove",
                            taskPermissionName: 'REJECT_LOAN'
                        }
                    ],
                        options: [
                            {
                                name: "button.assignloanofficer",
                                taskPermissionName: 'UPDATELOANOFFICER_LOAN'
                            },
                            {
                                name: "button.withdrawnbyclient",
                                taskPermissionName: 'WITHDRAW_LOAN'
                            },
                            {
                                name: "button.delete",
                                taskPermissionName: 'DELETE_LOAN'
                            },
                            {
                                name: "button.addcollateral",
                                taskPermissionName: 'CREATE_COLLATERAL'
                            },
                            {
                                name: "button.guarantor",
                                taskPermissionName: 'CREATE_GUARANTOR'
                            },
                            {
                                name: "button.loanscreenreport",
                                taskPermissionName: 'READ_LOAN'
                            }
                        ]

                    };
                }

                if (data.status.value == "Approved") {
                    scope.buttons = { singlebuttons: [
                        {
                            name: "button.assignloanofficer",
                            icon: "icon-user",
                            taskPermissionName: 'UPDATELOANOFFICER_LOAN'
                        },
                        {
                            name: "button.disburse",
                            icon: "icon-flag",
                            taskPermissionName: 'DISBURSE_LOAN'
                        },
                        {
                            name: "button.disbursetosavings",
                            icon: "icon-flag",
                            taskPermissionName: 'DISBURSETOSAVINGS_LOAN'
                        },
                        {
                            name: "button.undoapproval",
                            icon: "icon-undo",
                            taskPermissionName: 'APPROVALUNDO_LOAN'
                        }
                    ],
                        options: [
                            {
                                name: "button.addloancharge",
                                taskPermissionName: 'CREATE_LOANCHARGE'
                            },
                            {
                                name: "button.guarantor",
                                taskPermissionName: 'CREATE_GUARANTOR'
                            },
                            {
                                name: "button.loanscreenreport",
                                taskPermissionName: 'READ_LOAN'
                            }
                        ]

                    };
                }

                if (data.status.value == "Active") {
                    scope.buttons = { singlebuttons: [
                        {
                            name: "button.addloancharge",
                            icon: "icon-plus-sign",
                            taskPermissionName: 'CREATE_LOANCHARGE'
                        },
                        {
                            name: "button.makerepayment",
                            icon: "icon-dollar",
                            taskPermissionName: 'REPAYMENT_LOAN'
                        },
                        {
                            name: "button.undodisbursal",
                            icon: "icon-undo",
                            taskPermissionName: 'DISBURSALUNDO_LOAN'
                        }
                    ],
                        options: [
                            {
                                name: "button.waiveinterest",
                                taskPermissionName: 'WAIVEINTERESTPORTION_LOAN'
                            },
                            {
                                name: "button.writeoff",
                                taskPermissionName: 'WRITEOFF_LOAN'
                            },
                            {
                                name: "button.close-rescheduled",
                                taskPermissionName: 'CLOSEASRESCHEDULED_LOAN'
                            },
                            {
                                name: "button.close",
                                taskPermissionName: 'CLOSE_LOAN'
                            },
                            {
                                name: "button.loanscreenreport",
                                taskPermissionName: 'READ_LOAN'
                            }
                        ]

                    };

                    if (data.canDisburse) {
                        scope.buttons.singlebuttons.splice(1, 0, {
                            name: "button.disburse",
                            icon: "icon-flag",
                            taskPermissionName: 'DISBURSE_LOAN'
                        });
                        scope.buttons.singlebuttons.splice(1, 0, {
                            name: "button.disbursetosavings",
                            icon: "icon-flag",
                            taskPermissionName: 'DISBURSETOSAVINGS_LOAN'
                        });
                    }
                    //loan officer not assigned to loan, below logic
                    //helps to display otherwise not
                    if (!data.loanOfficerName) {
                        scope.buttons.singlebuttons.splice(1, 0, {
                            name: "button.assignloanofficer",
                            icon: "icon-user",
                            taskPermissionName: 'UPDATELOANOFFICER_LOAN'
                        });
                    }
                }
                if (data.status.value == "Overpaid") {
                    scope.buttons = { singlebuttons: [
                        {
                            name: "button.transferFunds",
                            icon: "icon-exchange",
                            taskPermissionName: 'CREATE_ACCOUNTTRANSFER'
                        }
                    ]
                    };
                }
            });

            resourceFactory.loanResource.getAllNotes({loanId: routeParams.id,resourceType:'notes'}, function (data) {
                scope.loanNotes = data;
            });

            scope.saveNote = function () {
                resourceFactory.loanResource.save({loanId: routeParams.id, resourceType: 'notes'}, this.formData, function (data) {
                    var today = new Date();
                    temp = { id: data.resourceId, note: scope.formData.note, createdByUsername: "test", createdOn: today };
                    scope.loanNotes.push(temp);
                    scope.formData.note = "";
                    scope.predicate = '-id';
                });
            };

            scope.showDetails = function (id) {
                resourceFactory.guarantorResource.get({loanId: routeParams.id, templateResource: id}, {}, function (data) {
                    scope.guarantorData = data;
                });

            };
            scope.deleteGroup = function (id) {
                scope.guarantorId = id;
                $modal.open({
                    templateUrl: 'deleteguarantor.html',
                    controller: GuarantorDeleteCtrl,
                    resolve: {
                        id: function () {
                            return scope.guarantorId;
                        }
                    }
                });
            };
            var GuarantorDeleteCtrl = function ($scope, $modalInstance, id) {
                $scope.delete = function () {
                    resourceFactory.guarantorResource.delete({loanId: routeParams.id, templateResource: id}, {}, function (data) {
                        $modalInstance.close('delete');
                        route.reload();
                    });
                };
                $scope.cancel = function () {
                    $modalInstance.dismiss('cancel');
                };
            };

            scope.getLoanDocuments = function () {
                resourceFactory.LoanDocumentResource.getLoanDocuments({loanId: routeParams.id}, function (data) {
                    for (var i in data) {
                        var loandocs = {};
                        loandocs = API_VERSION + '/loans/' + data[i].parentEntityId + '/documents/' + data[i].id + '/attachment?tenantIdentifier=default';
                        data[i].docUrl = loandocs;
                    }
                    scope.loandocuments = data;
                });

            };

            resourceFactory.DataTablesResource.getAllDataTables({apptable: 'm_loan'}, function (data) {
                scope.loandatatables = data;
            });

            scope.dataTableChange = function (datatable) {
                resourceFactory.DataTablesResource.getTableDetails({datatablename: datatable.registeredTableName,
                    entityId: routeParams.id, genericResultSet: 'true'}, function (data) {
                    scope.datatabledetails = data;
                    scope.datatabledetails.isData = data.data.length > 0 ? true : false;
                    scope.datatabledetails.isMultirow = data.columnHeaders[0].columnName == "id" ? true : false;
                    scope.singleRow = [];
                    for (var i in data.columnHeaders) {
                        if (scope.datatabledetails.columnHeaders[i].columnCode) {
                            if (data.columnHeaders[i].columnName.indexOf("_cd_") > 0) {
                                var temp = data.columnHeaders[i].columnName.split("_cd_");
                                data.columnHeaders[i].columnName = temp[1];
                            } else if (data.columnHeaders[i].columnName.indexOf("_cv_") > 0) {
                                var temp = data.columnHeaders[i].columnName.split("_cv_");
                                data.columnHeaders[i].columnName = temp[1];
                            }
                            for (var j in scope.datatabledetails.columnHeaders[i].columnValues) {
                                for (var k in data.data) {
                                    if (data.data[k].row[i] == scope.datatabledetails.columnHeaders[i].columnValues[j].id) {
                                        data.data[k].row[i] = scope.datatabledetails.columnHeaders[i].columnValues[j].value;
                                    }
                                }
                            }
                        }
                    }
                    if (scope.datatabledetails.isData) {
                        for (var i in data.columnHeaders) {
                            if (!scope.datatabledetails.isMultirow) {
                                var row = {};
                                row.key = data.columnHeaders[i].columnName;
                                row.value = data.data[0].row[i];
                                scope.singleRow.push(row);
                            }
                        }
                    }

                });
            };

            scope.export = function () {
                scope.report = true;
                scope.printbtn = false;
            };

            scope.viewLoanDetails = function () {
                scope.report = false;
            };

            scope.viewprintdetails = function () {
                scope.printbtn = true;
                scope.hidePentahoReport = true;
                scope.formData.outputType = 'HTML';
                scope.baseURL = $rootScope.hostUrl + API_VERSION + "/runreports/" + encodeURIComponent("Client Loan Account Schedule");
                scope.baseURL += "?output-type=" + encodeURIComponent(scope.formData.outputType) + "&tenantIdentifier=" + $rootScope.tenantIdentifier+"&locale="+scope.optlang.code;

                var reportParams = "";
                scope.startDate = dateFilter(scope.date.fromDate, 'yyyy-MM-dd');
                scope.endDate = dateFilter(scope.date.toDate, 'yyyy-MM-dd');
                var paramName = "R_startDate";
                reportParams += encodeURIComponent(paramName) + "=" + encodeURIComponent(scope.startDate)+ "&";
                paramName = "R_endDate";
                reportParams += encodeURIComponent(paramName) + "=" + encodeURIComponent(scope.endDate)+ "&";
                paramName = "R_selectLoan";
                reportParams += encodeURIComponent(paramName) + "=" + encodeURIComponent(scope.loandetails.accountNo);
                if (reportParams > "") {
                    scope.baseURL += "&" + reportParams;
                }
                // allow untrusted urls for iframe http://docs.angularjs.org/error/$sce/insecurl
                scope.baseURL = $sce.trustAsResourceUrl(scope.baseURL);
                
            };

            scope.printReport = function () {
                window.print();
                window.close();
            }

            scope.deleteAll = function (apptableName, entityId) {
                resourceFactory.DataTablesResource.delete({datatablename: apptableName, entityId: entityId, genericResultSet: 'true'}, {}, function (data) {
                    route.reload();
                });
            };

            scope.deleteDocument = function (documentId, index) {
                resourceFactory.LoanDocumentResource.delete({loanId: scope.loandetails.id, documentId: documentId}, '', function (data) {
                    scope.loandocuments.splice(index, 1);
                });
            };

            scope.downloadDocument = function (documentId) {

            };

        }
    });
    mifosX.ng.application.controller('ViewLoanDetailsController', ['$scope', '$routeParams', 'ResourceFactory', '$location', '$route', '$http', '$modal', 'dateFilter', 'API_VERSION', '$sce', '$rootScope', mifosX.controllers.ViewLoanDetailsController]).run(function ($log) {
        $log.info("ViewLoanDetailsController initialized");
    });
}(mifosX.controllers || {}));

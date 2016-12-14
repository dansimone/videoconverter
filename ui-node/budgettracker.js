Videos = new Mongo.Collection("videos");
Categories = new Mongo.Collection("categories");
Transactions = new Mongo.Collection("transactions");

if (Meteor.isClient) {

  /**
   * Main Helpers
   */
  Template.main.helpers({
    getErrorClass: function (fieldName) {
      return getErrorClass(fieldName);
    }
  });
  Template.main.events({
  });

  /**
   * Pending Videos Helpers
   */
  Template.pending.helpers({
    videos: function () {
      return Videos.find({status: "PENDING"}/*,{sort: Session.get('txnSortField')}*/);
    }
  });

  /**
   * In Progress Videos Helpers
   */
  Template.inprogress.helpers({
    videos: function () {
      return Videos.find({status: "IN_PROGRESS"}/*,{sort: Session.get('txnSortField')}*/);
    },
    getPercentComplete: function () {
      return this.percentComplete;
    }
    /*
    getAmount: function () {
      return Math.abs(this.amount).toFixed(2);
    }*/
  });

  /**
   * Completed Videos Helpers
   */
  Template.completed.helpers({
    videos: function () {
      return Videos.find({status: "COMPLETED"}/*,{sort: Session.get('txnSortField')}*/);
    }
  });

  /*
  Template.transactionslist.events(
    {
      // Clicking Add Transaction button
      'click div.add-transaction a': function () {
        event.preventDefault();
        if (Session.get("adding_transaction")) {
          Session.set("adding_transaction", false);
        }
        else {
          Session.set("adding_transaction", true);
        }
      },
      // Submitting a new transaction
      'submit form.add-transaction': function () {
        event.preventDefault();

        // In case of error, highlight the offending fields
        var error = false;
        var amount = event.target.amount.value;
        if (amount.length == 0) {
          Session.set("formError-transaction-amount", true);
          error = true;
        }
        else {
          Session.set("formError-transaction-amount", false);
        }
        var dateString = event.target.date.value + " PDT";
        if (event.target.date.value.length == 0) {
          Session.set("formError-transaction-date", true);
          error = true;
        }
        else {
          Session.set("formError-transaction-date", false);
        }
        // Return control if any form errors found
        if (error) {
          return;
        }

        var comments = event.target.comments.value;
        var type = event.target.type.value;
        var category;
        if (type == "deposit") {
          category = "Deposit";
        }
        else {
          category = event.target.category.value;
        }

        // If the date entered is today, use the exact time now as the Date, otherwise
        // just use the day
        var date = new Date(dateString);
        var today = new Date();
        if (today.getFullYear() == date.getFullYear() && today.getMonth() == date.getMonth()
          && today.getDate() == date.getDate()) {
          date = today;
        }

        // Insert the new transaction
        Transactions.insert({
          category_id: category,
          amount: parseFloat(-amount),
          date: date,
          type: type,
          comments: comments
        });
        Session.set("adding_transaction", false);
      },
      'click select.transaction-type': function () {
        var name = event.target.value;
        if (name == "deposit") {
          Session.set("adding_transaction_withdrawal", false);
        } else {
          Session.set("adding_transaction_withdrawal", true);
        }
      },
      // Clicking any field of the Add Transaction form currently in error
      'click .form-group.has-error input,textarea': function (event) {
        Session.set("formError-" + event.target.closest('.form-group').getAttribute("name"), false);
      },
      // Clicking the Transaction table category column
      'click th.sort-categories': function () {
        var sortOrder = 1;
        if (Session.get('txnSortField') != null && Session.get('txnSortField').category_id != null) {
          sortOrder = Session.get('txnSortField').category_id * -1;
        }
        Session.set('txnSortField', {category_id: sortOrder, date: -1});
      },
      // Clicking the Transaction table date column
      'click th.sort-dates': function () {
        var sortOrder = 1;
        if (Session.get('txnSortField') != null && Session.get('txnSortField').date != null) {
          sortOrder = Session.get('txnSortField').date * -1;
        }
        Session.set('txnSortField', {date: sortOrder});
      },
      // Clicking the Transaction table amount column
      'click th.sort-amounts': function () {
        var sortOrder = 1;
        if (Session.get('txnSortField') != null && Session.get('txnSortField').amount != null) {
          sortOrder = Session.get('txnSortField').amount * -1;
        }
        Session.set('txnSortField', {amount: sortOrder, date: -1});
      }
    }
  );
  */

  /**
   * Categories List Helpers
   */
  /*
  Template.categorieslist.helpers({
    categories: function () {
      return Categories.find({}, {sort: {_id: 1}});
    },
    isAddingCategory: function () {
      return Session.get("adding_category");
    },
    getAmount: function () {
      return this.amount.toFixed(2);
    },
    getAmountUsedForThisMonth: function () {
      var monthStartDate = getSelectedMonthStartDate();
      return getAmountUsedForMonth(this, monthStartDate).toFixed(2);
    },

    getProgressBarClass: function () {
      var monthStartDate = getSelectedMonthStartDate();
      var amountUsed = getAmountUsedForMonth(this, monthStartDate);
      var percentUsed = Math.round(amountUsed / this.amount * 100);
      if (percentUsed > 80) {
        return "progress-bar-danger";
      } else if (percentUsed > 50) {
        return "progress-bar-warning";
      }
      else {
        return "progress-bar-success";
      }
    },
    getErrorClass: function (fieldName) {
      return getErrorClass(fieldName);
    }
  });
  */

  /*
  Template.categorieslist.events(
    {
      // Clicking the Add Category button
      'click div.add-category a': function () {
        event.preventDefault();
        if (Session.get("adding_category")) {
          Session.set("adding_category", false);
        }
        else {
          Session.set("adding_category", true);
        }
      },
      // Submitting the Add Category form
      'submit form.add-category': function () {
        event.preventDefault();

        // In case of error, highlight the offending fields
        var error = false;
        var name = event.target.name.value;
        if (name.length == 0) {
          Session.set("formError-category-name", true);
          error = true;
        }
        else {
          Session.set("formError-category-name", false);
        }
        var amount = event.target.amount.value;
        if (amount.length == 0) {
          Session.set("formError-category-amount", true);
          error = true;
        }
        else {
          Session.set("formError-category-amount", false);
        }
        // Return control if any form errors found
        if (error) {
          return;
        }

        // Insert the new category
        Categories.insert({_id: name, amount: parseFloat(amount)});
        Session.set("adding_category", false);
      },
      // Clicking any field of the Add Category form currently in error
      'click .form-group.has-error input,textarea': function (event) {
        Session.set("formError-" + event.target.closest('.form-group').getAttribute("name"), false);
      },
      // Clicking any amount in the Category table
      'click tr.category-row td span.category-amount': function () {
        // A little logic to make the amount temporarily editable
        var cell = $(event.target);
        var currentAmount = cell.text();
        cell.text("");
        var categoryId = cell.closest('tr').attr("id");
        $('<input />').appendTo(cell).val(currentAmount).select().on("blur keyup",
          function (event) {
            // Ignore anything that is a key press but *not* an enter
            if (event.keyCode != null && event.keyCode != 13) {
              return;
            }
            // Restore value if not a number
            var newAmount;
            if (isNaN($(this).val())) {
              newAmount = currentAmount;
            }
            else {
              newAmount = parseFloat($(this).val()).toFixed(2);
            }
            cell.find("input").remove();
            if (newAmount != currentAmount) {
              cell.text("");
              Categories.update({_id: categoryId}, {$set: {amount: parseFloat(newAmount)}});
              console.log("Updated " + categoryId + " to " + newAmount);
            }
            else {
              cell.text(newAmount);
            }
          });
      },
      // Clicking on the remove button for a row in the Transaction table
      'click tr.category-row td a.category-remove': function () {
        event.preventDefault();
        var cell = $(event.target);
        var categoryId = cell.closest('tr').attr("id");
        if (confirm("Are you sure you want to delete this entire category and all of its associated transactions?") == true) {
          Categories.remove(categoryId);
          // Delete any matching transactions
          matchingTransactions = Transactions.find(
            {
              category_id: categoryId
            });
          matchingTransactions.forEach(function (transaction) {
            Transactions.remove(transaction._id);
          });
        }
      }
    }
  );
  */
}

// On server startup, seed some sample data, if the DB is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {

    // REST API configuration
    var Api = new Restivus({
      useDefaultAuth: true,
      prettyJson: true
    });
    //Api.addCollection(Videos);
    Api.addRoute('videos', {authRequired: false}, {
      get: function () {
        return Videos.find({}).fetch();
      },
      post: function () {
        if (this.bodyParams.name == null) {
          return {statusCode: 400, message: 'Name not provided'}
        }
        // Insert the new video
        Videos.insert({
          name: this.bodyParams.name,
          status: "PENDING",
          percentComplete: 0
        });
        return {statusCode: 200};
      }
    });
    Api.addRoute('videos/:id', {authRequired: false}, {
      get: function () {
        return Videos.findOne(this.urlParams.id);
      },
      put: function () {
        video = Videos.findOne(this.urlParams.id);
        if(video == null) {
          return {statusCode: 404,  message: 'Video not found'}
        }
        s = this.bodyParams.status != null ? this.bodyParams.status : video.status;
        p = this.bodyParams.percentComplete != null ? this.bodyParams.percentComplete : video.percentComplete;

        console.log("Updating with status: " + s + " " +  p);
        Videos.update({_id: video._id}, {$set: {status: s, percentComplete: p}});
        return {statusCode: 200};
        }
    });
  });
}

/**
 * General Helper Functions.
 */
/*
function getSelectedMonthStartDate() {
  if (Session.get("selectedMonth") != null) {
    return Session.get("selectedMonth");
  }
  else {
    var today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  }
}

function getErrorClass(fieldName) {
  if (Session.get("formError-" + fieldName) != null && Session.get("formError-" + fieldName)) {
    return "has-error";
  }
  else {
    return "";
  }
}
*/
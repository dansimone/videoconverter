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
  Template.upload.events(
    {  // Clicking the Transaction table date column
      'click th.sort-dates': function () {
        var sortOrder = 1;
        if (Session.get('txnSortField') != null && Session.get('txnSortField').date != null) {
          sortOrder = Session.get('txnSortField').date * -1;
        }
        Session.set('txnSortField', {date: sortOrder});
      },
      // Clicking the Transaction table amount column
      "change .myFileInput": function(event, template) {
        var file = event.target.files[0];
        if (!file) return;

        videoId = Videos.insert({
          name: file.name,
          originalSize: 0, //getFileSizeString(fileObj.size()),
          status: "PENDING",
          percentComplete: 0
        });

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/uploadToProcessor/' + videoId, true);
        xhr.onload = function(event){}
        xhr.send(file);

        event.target.value = null;
      }
    }
  );

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
    var http = Npm.require('http');
    var fs = Npm.require('fs');
    var tmp = Npm.require('tmp');

    // Create temporary directory
    var tmpDir = tmp.dirSync().name;
    console.log('Created tmp dir: ' + tmpDir);

    var localUrl = Meteor.absoluteUrl();
    console.log('Local URL is: ' + localUrl);

    // Configuration of REST API for Processor Node callbacks
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
        if (this.queryParams.name == null) {
          return {statusCode: 400, message: 'Name not provided'}
        }
        // Insert the new video
        Videos.insert({
          name: this.queryParams.name,
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
        s = this.queryParams.status != null ? this.queryParams.status : video.status;
        p = this.queryParams.percentComplete != null ? this.queryParams.percentComplete : video.percentComplete;

        console.log("Updating with status: " + s + " " +  p);
        Videos.update({_id: video._id}, {$set: {status: s, percentComplete: p}});
        return {statusCode: 200};
        }
    });

    // Internal URL to send input files from client to server
    WebApp.connectHandlers.use('/uploadToProcessor',function(req,res){
      var parts = req.url.split("/");
      id = parts[1];
      console.log('Uploading file ' + id + ' to Processor Node');
      var start = Date.now()
      tmpFile = tmpDir +'/' + id;
      var file = fs.createWriteStream(tmpFile);

      file.on('error',function(error){
        console.log('Error ' + error);
      });
      file.on('finish',function(){
        res.writeHead(200)
        res.end();
        console.log('Finished uploading from client server, millis taken: ' + (Date.now() - start));

        //
        // Pass the file along to the processor
        //
        var options = {
          host: "localhost",
          port: 8080,
          path: '/convert?id=' + id + "&callbackUrl=" + localUrl,
          method: 'POST'
        };

        var req = http.request(options, function (res) {
          console.log('Processor request status: ' + res.statusCode);
        });
        // Read from the local file and stream to the processor node
        var readStream = fs.createReadStream(tmpFile);
        readStream.on('data', function (chunk) {
          req.write(chunk);
        }).on('end', function () {
          req.end();
          // Delete the tmp file - we don't need it anymore
          fs.unlink(tmpFile);
        });
      });

      req.pipe(file); // pipe the request to the file
    });
  });
}

/**
 * General Helper Functions.
 */
function getFileSizeString(bytes) {
  return (bytes / (1024*1024)).toFixed(2) + "MB";
}

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

function verifyEnvVar(name, value) {
  if (value == null) {
    throw ('Environment variable ' + name + ' must be set');
  }
  return value;
}
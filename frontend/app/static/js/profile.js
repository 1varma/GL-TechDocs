$(function () {
    $("#accordion").accordion({ heightStyle: 'panel', collapsible: true });
});

$(document).ready(function () {
    validateFormsAndAddHandlers();
    loadProfileData();
});

function updateProfile(data) {
    userData = data.userData;
    usageStats = data.usageStats;
    $('#first-name').val(userData.firstName);
    $('#last-name').val(userData.lastName);
    $('#address').val(userData.address.streetAddress);
    $('#country').val(userData.address.country);
    $('#country').selectpicker('refresh');
    $('#country').trigger('change');
    
    $('#state').val(userData.address.state);
    $('#state').selectpicker('refresh');

    $('#occupation').val(userData.occupation);
    $('#purpose').val(userData.purposeOfUse);
    $('#purpose').selectpicker('refresh');

    $('#signupdate').text(usageStats.signUpDate);
    $('#activedate').text(usageStats.lastActiveDate);

}

function loadProfileData() {
    try {
        $.ajax({
            data: {
                authToken: getUserToken()
            },
            type: 'POST',
            url: getApiUrl('getProfile'),
            success: function (data) {
                //In case of success the data contains the JSON


                    updateProfile(data);
 
            },
            error: function (data) {
                // in case of error we need to read response from data.responseJSON
                showAlert('#profile-errorMessage', 'alert-danger', "Profile Update!!", getResponseMessage(data));
            }
        });
    }
    catch (e) {
        console.log(e)
    }
}

function profileUpdate() {
    try {
        $.ajax({
            data: {
                authToken: getUserToken(),
                userData:
                {
                    firstName: $('#first-name').val(),
                    lastName: $('#last-name').val(),
                }

            },
            type: 'POST',
            url: getApiUrl('updateProfile'),
            success: function (data) {
                //In case of success the data contains the JSON


                    showAlert('#profile-errorMessage', 'alert-success', "Profile Update!!", data.message);


            },
            error: function (data) {
                // in case of error we need to read response from data.responseJSON
                showAlert('#profile-errorMessage', 'alert-danger', "Profile Update!!", getResponseMessage(data));
            }
        });
    }
    catch (e) {
        console.log(e)
    }
}

function changePassword() {
    removeAlert('#password-errorMessage');
    try {
        $.ajax({
            data: {
                authToken: getUserToken(),
                currentPassword: $('#current-password').val(),
                newPassword: $('#new-password').val(),

            },
            type: 'POST',
            url: getApiUrl('changePassword'),
            success: function (data) {
                //In case of success the data contains the JSON

                
                    showAlert('#password-errorMessage', 'alert-success', "Change Password!!", "Successfully changed");
               
            },
            error: function (data) {
                // in case of error we need to read response from data.responseJSON
                showAlert('#password-errorMessage', 'alert-danger', "Change Password!!", getResponseMessage(data));
            }
        });
    }
    catch (e) {
        console.log(e)
    }
}
function clearSession() {
    var AUT = getUserToken();
    localStorage.clear();
    $.ajax({
        data: {
            authToken: AUT
        },
        type: 'POST',
        url: getFrontEndUrl('clearSession'),
        success: async function (data) {
            await new Promise(r => setTimeout(r, 2000));
            window.location.replace('/');
        },
        error: async function (data) {
            await new Promise(r => setTimeout(r, 2000));
            window.location.replace('/');
        }
    });
}
function deleteAccount() {
    removeAlert('#delete-errorMessage');
    try {
        $.ajax({
            data: {
                authToken: localStorage.getItem('userToken'),
                currentPassword: $('#delete-password').val()


            },
            type: 'POST',
            url: getApiUrl('deleteAccount'),
            success: function (data) {
                //In case of success the data contains the JSON

                if (data.status == true) {
                    showAlert('#delete-errorMessage', 'alert-success', "Delete Account!!", "Account Deleted Fully");
                    clearSession();
                }
                else {
                    showAlert('#delete-errorMessage', 'alert-warning', "Delete Account!!", data.message);
                }
            },
            error: function (data) {
                // in case of error we need to read response from data.responseJSON
                showAlert('#delete-errorMessage', 'alert-danger', "Delete Account!!", getResponseMessage(data));
            }
        });
    }
    catch (e) {
        console.log(e)
    }
}
var passwordFormRules =
{
    'current-password': {
        required: true,
    },
    'new-password': {
        required: true,
        strong_password: true,
        minlength: 6
    },
    'confirm-password': {
        required: true,
        equalTo: "#new-password"
    }
};

var passwordFormMessages =
{
    'current-password': {
        required: "Cannot be blank"
    },
    'new-password': {
        required: "Cannot be blank",
        minlength: "Need at least 6 characters"
    },
    'confirm-password': {
        required: "Confirm your new password",
        equalTo: "Should be same as above"
    },

};

var profileUpdateRules =
{
    'first-name': {
        require_from_group: [1, ".namegroup"]
    },
    'last-name': {
        require_from_group: [1, ".namegroup"]
    }
};

var profileUpdateMessages =
{
    'first-name': {
        require_from_group: "At least one field is needed"
    },
    'last-name': {
        require_from_group: "At least one field is needed"
    }
};

var deleteAccountRules =
{
    'delete-password': {
        required: true
    },
    'confirm-delete': {
        required: true
    }
};

var deleteAccountMessages =
{
    'delete-password': {
        required: "Confirm your password"
    },
    'confirm-delete': {
        required: "Please check the box"
    }
};
function validateFormsAndAddHandlers() {

    $("#password").validate({
        rules: passwordFormRules,
        errorClass: "inputValidationError",
        errorPlacement: function (error, element) {
            element.next("label").after(error);
        },
        submitHandler: function (form) {
            changePassword();
        },
        messages: passwordFormMessages
    });

    $("#profileForm").validate({
        rules: profileUpdateRules,
        errorClass: "inputValidationError",
        errorPlacement: function (error, element) {
            element.next("label").after(error);
        },
        submitHandler: function (form) {
            profileUpdate();
        },
        messages: profileUpdateMessages
    });

    $("#deleteAccount").validate({
        rules: deleteAccountRules,
        errorClass: "inputValidationError",

        errorPlacement: function (error, element) {
            element.next("label").after(error);
        },
        submitHandler: function (form) {
            deleteAccount();
        },
        messages: deleteAccountMessages
    });

    $("form").each(function () {
        $(this).validate();
    });

}
$(document).ready(function(){
    $("#country").on("changed.bs.select", 
        function(e, clickedIndex, newValue, oldValue) {
        console.log(this.value, clickedIndex, newValue, oldValue);
        stateOp=getStateOptions(this.value);
        $("#state").html(stateOp);
        $("#state").selectpicker('destroy');
        $("#state").selectpicker('render');
        $("#state").selectpicker('refresh');
    });

});

$("select").on('change', function (e) {
  console.log(e);
});
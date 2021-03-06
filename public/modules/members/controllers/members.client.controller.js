'use strict';

// Members controller
angular.module('members').controller('MembersController', ['$scope', '$stateParams', '$location', 'Authentication', 'Members', 'Participants',
	function($scope, $stateParams, $location, Authentication, Members, Participants) {
		$scope.authentication = Authentication;
		$scope.errorStatus = {};

		if (!$scope.authentication.user) $location.path('/signin');

		$scope.dateToFilterBy = null;
		$scope.status = { dateOpen: false };

		$scope.open = function($event) {
		    $event.preventDefault();
		    $event.stopPropagation();

		    $scope.status.dateOpen = !$scope.status.dateOpen;
		  };

		$scope.setErrors = function(errors) {
			$scope.errorStatus = {};
			if (errors.fields) {
				for (var ei in errors.fields) {
					$scope.errorStatus[errors.fields[ei]] = 'has-error';
				}
			}
			$scope.errorMessages = errors.messages;
		};

		// Create new Member
		$scope.create = function() {

			var clearFields = function(Participant) {
				$scope.errorMessages = null;
				$scope.errorStatus = {};
				$scope.member.firstName = '';
				$scope.member.lastName = '';
				$scope.member.phone = '';
				$scope.member.email = '';
				$scope.member.identity = '';
				$scope.member.affiliation = '';
				$scope.member.address = '';
				$scope.member.city = '';
				$scope.member.state = '';
				$scope.member.zipCode = '';
				$scope.member.shirtSize = '';
				$scope.member.shirtReceived = '';
				$scope.member.talent = '';
				$scope.member.placeOfWorship = '';
				$scope.member.recruitment = '';
				$scope.member.communityNetworks = '';
				$scope.member.extraGroups = '';
				$scope.member.otherNetworks = '';
			};

			// Create new Member
			var member = $scope.member;
			member.became_member = new Date();

			if(member && member._id) {
				member.$update(function(response) {
					$location.path('members/' + response._id);
					clearFields(response);
				}, function(errorResponse) {
				    $scope.error = errorResponse.data.message;
				    $scope.errors = $scope.setErrors(errorResponse.data);

				});

			} else {
				// Redirect after save
				member.$save(function(response) {
					$location.path('members/' + response._id);
					clearFields(response);
				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				    $scope.errors = $scope.setErrors(errorResponse.data);
				});

			}
		};

		// Remove existing Member
		$scope.remove = function(member) {
			if ( member ) {
				member.$remove();

				for (var i in $scope.members) {
					if ($scope .members [i] === member) {
						$scope.members.splice(i, 1);
					}
				}
			} else {
				$scope.member.$remove(function() {
					$location.path('members');
				});
			}
		};

		// Update existing Member
		$scope.update = function() {
			var member = $scope.member;

			member.$update(function() {
				$location.path('members/' + member._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			    $scope.errors = $scope.setErrors(errorResponse.data);
			});
		};


		// Find a list of Members
		$scope.find = function() {
			$scope.members = Members.query();
		};

		$scope.filterMember = function(member) {
			if (!$scope.shirtFilter(member)) { return false; }
			if (!$scope.filterByDate(member)) { return false; }

			return true;
		};

		$scope.showOnlyShirtlessMembers = false;

		$scope.shirtFilter = function(member) {
			if($scope.showOnlyShirtlessMembers === true) {
				return member.shirtReceived === false;
			} else {
				return true;
			}
		};

		$scope.filterByDate = function(member) {
			if($scope.dateToFilterBy) {
				var newDate = new Date(member.became_member);
				return newDate >= $scope.dateToFilterBy;
			} else {
				return true;
			}

		};

		$scope.giveShirt = function(member) {
			//var member = $scope.member;
			if(member.shirtReceived === false) {
				member.shirtReceived = true;

				member.$update(function() {

				}, function(errorResponse) {
					$scope.error = errorResponse.data.message;
				});
			}
		};

		// Find existing participants
		$scope.findParticipants = function(name) {
			return Participants.query({name: name}).$promise;
		};

		// Find existing Member
		$scope.findOne = function() {
			$scope.member = Members.get({
				memberId: $stateParams.memberId
			});
		};

		// Initialize a new Member
		$scope.newMember = function() {
			$scope.member = new Members({
				communityNetworks: '',
				extraGroups: '',
				otherNetworks: ''
			});
		};

		// A member is selected from the typehead search
		$scope.selectMember = function(participant) {
			$scope.member = new Members(participant);
			$scope.member.communityNetworks = '';
			$scope.member.extraGroups = '';
			$scope.member.otherNetworks = '';
		};
		
		$scope.exportToExcel = function() {
			var csvData = [[
				'Name',
				'Phone',
				'Email',
				'Identity',
				'Affiliation',
				'Address',
				'City',
				'State',
				'Zip Code',
				'Shirt Size',
				'Shirt Received',
				'Talent',
				'Place of Worship',
				'Recruitment',
				'Community Networks',
				'Extra Groups',
				'Other Networks'
			]];

			for (var i = 0; i < $scope.members.length; i++) {
				var member = $scope.members[i];
				if ($scope.filterMember(member)) {
					csvData.push([
						member.displayName,
						member.phone,
						member.email,
						member.identity,
						member.affiliation,
						member.address,
						member.city,
						member.state,
						member.zipCode,
						member.shirtSize,
						member.shirtReceived ? 'Yes' : 'No',
						member.talent,
						member.placeOfWorship,
						member.recruitment,
						member.communityNetworks,
						member.extraGroups,
						member.otherNetworks
					].join(','));
				}
			}
			var el = document.createElement('a');
			el.id = 'downloadFile';
			el.href = 'data:text/csv;charset=utf8,' + encodeURIComponent(csvData.join('\n'));
			el.download = 'members.csv';
			
			var before = document.getElementById('exportLink');
			before.parentNode.insertBefore(el, before);
			el.click();
			el.remove();
		};
	}
]);

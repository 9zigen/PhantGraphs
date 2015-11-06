'use strict';

angular.module('phantGraph')
	.controller('StreamsCtrl',["$scope","phantservers","phantstreams","phantStreamsServices","phantApiServices", function($scope,phantservers,phantstreams,phantStreamsServices,phantApiServices) {
            
            $scope.alerts = [];
            
            $scope.serversList = phantservers.data; // Returns a JSON ARRAY with servers
            $scope.streamsList = phantstreams.data; // JSON Array with streams

            $scope.closeAlert = function(index) {
                $scope.alerts.splice(index, 1);
            };

            function pushError(error) {
                $scope.alerts.push({
                    type: "warning",
                    msg: error
                });
            };
            
            function getServerUrlByID(serverID) {
                var server = $scope.serversList.filter(srv) {
                    return srv.rowid = serverID;
                };
                return srv[0].url;
            }
            
            // For each stream, query the server for the stream fields.
            function getStreamFields( streamID ) {
                try {
                    phantApiServices.streamInfo( getServerUrlByID($scope.streamsList[streamID].serverid), $scope.streamsList[streamID].key )
                        .then ( function ( result ) {
                            //console.log("getStreamFields SUCCESS: ");
                            $scope.streamsList[streamID].fields=[];
                            angular.forEach( result.data[0] , function ( value , key ) // yes, its first value and then key 
                                {
                                    //console.log("Key: " + key +"  Value: " + value );
                                    $scope.streamsList[streamID].fields.push(key);
                                }
                            
                            );
                        
                        },
                            function ( result ) {
                                console.log("Error.....");
                                $scope.streamsList[streamID].fields=[];

                                pushError("Can't get fields for " + $scope.streamsList[streamID].name);
                            }
                        );
                } catch(err) {    console.log(err.name + ': "' + err.message +  '" occurred when retrieving Stream Fields.') };
                
            }
            
            function displayStreamFields() {
                // Fill Stream fields async
                for ( var i = 0 ; i < $scope.streamsList.length ; i++ ) {
                    getStreamFields( i );
                }
            }

            function getPhantStreams() {
                phantStreamsServices.all()
                    .then( function ( result ) {
                        $scope.streamsList = result.data;
                        //console.log( result.data );
                        if ($scope.refreshFields == true) 
                            displayStreamFields();
                    });
            };
                 
            function createStream(stream) {
                phantStreamsServices.create(stream)
                    .then(function (result) {
                        initCreateForm();
                        getPhantStreams();
                        displayStreamFields();
                    });
            }

            function initCreateForm() {
                $scope.newStream = { name: '', key: '' };
            }

            function deleteStream(streamID) {
                //console.log("Deleting server via REST...");
                phantStreamsServices.destroy(streamID)
                    .then(function (result) {
                        cancelEditing();
                        getPhantStreams();
                        displayStreamFields();
                });
            }

            function setEditedStream(stream) {
                //console.log("Editing....");
                //console.log("Name:" + server.name );
                $scope.editedStream = angular.copy(stream);
                $scope.editedStream.selectedServer = $scope.serversList[$scope.editedStream.serverid-1];
                $scope.isEditing = true;               
            }
            
            function cancelEditing() {
                $scope.editedItem = null;
                $scope.isEditing = false;
            }
            
            
            function updateStream(stream) {
                //console.log("Update: " + server.name );
                stream.serverid = $scope.editedStream.selectedServer.rowid;
                //console.log("Choosen server: " + $scope.editedStream.selectedServer.rowid );
                phantStreamsServices.update( stream.rowid , stream)
                    .then( function (result) {
                        cancelEditing();
                        getPhantStreams(); 
                        $scope.refreshFields = true;
                        //displayStreamFields();
                    });
                
            }
            
            function isCurrentItem(itemId) {
                if ( $scope.editedStream !== null ) {
                    //console.log("is current: " +$scope.editedStream.rowid );
                }
                return $scope.editedStream !== null && $scope.editedStream.rowid === itemId;
            }       
            
            $scope.newStream = { name: '' , url: '' };
            $scope.createStream = createStream;
            $scope.deleteStream = deleteStream;
            $scope.updateStream = updateStream;
            $scope.setEditedStream = setEditedStream;
            $scope.cancelEditing = cancelEditing;
            $scope.isCurrentItem = isCurrentItem;
            $scope.editedStream = null;
            $scope.isEditing = false;
            $scope.refreshFields = false;   // Used after editing a stream.
  
            displayStreamFields();
            //createStream();
            
        }] );
        

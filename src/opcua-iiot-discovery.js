/*
 The BSD 3-Clause License

 Copyright 2016,2017,2018 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc. (node-red-contrib-opcua)
 All rights reserved.
 node-red-contrib-iiot-opcua
 */
'use strict'

/**
 * OPC UA node representation for Node-RED OPC UA IIoT nodes.
 *
 * @param RED
 */
module.exports = function (RED) {
  // SOURCE-MAP-REQUIRED
  let coreDiscovery = require('./core/opcua-iiot-core-discovery')

  function OPCUAIIoTDiscovery (config) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.discoveryPort = config.discoveryPort || 4840

    let node = this
    let discoveryServer = new coreDiscovery.core.nodeOPCUA.OPCUADiscoveryServer({port: node.discoveryPort})

    node.status({fill: 'blue', shape: 'ring', text: 'new'})

    coreDiscovery.detailDebugLog('discovery endpoints:' + discoveryServer._get_endpoints())

    discoveryServer.start(function () {
      coreDiscovery.internalDebugLog('discovery server started')
      node.status({fill: 'green', shape: 'dot', text: 'active'})
    })

    node.on('input', function (msg) {
      if (discoveryServer !== null) {
        msg.payload = {
          discoveryUrls: discoveryServer.getDiscoveryUrls() || [],
          endpoints: discoveryServer.endpoints || []
        }
      }
      node.send(msg)
    })

    node.on('close', function (done) {
      if (discoveryServer !== null) {
        discoveryServer.shutdown(function () {
          coreDiscovery.internalDebugLog('shutdown')
          done()
        })
        discoveryServer = null
      } else {
        done()
      }
    })
  }

  RED.nodes.registerType('OPCUA-IIoT-Discovery', OPCUAIIoTDiscovery)
}

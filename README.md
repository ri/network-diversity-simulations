# network-diversity-simulations

## Usage

In order to embed your own simulated diversity network graph, you just need to create a container element with class name `diversity-chart` with the following attributes:

  **data-size** The width/height (these are the same) of the graph

  **data-nodes** Number of nodes in the network

  **data-perc-follow** Percentage of red nodes followed

  **data-num-follow** Number of other nodes each individual follows

## Example

`<div class="diversity-chart" data-size="400" data-nodes="20" data-perc-follow="30" data-num-follow="10"></div>`

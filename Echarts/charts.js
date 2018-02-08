define(['Handlebars', 'moment'], function(Handlebars) {

	if (!('helper' in window))
		window['helper'] = {};

	helper.echartOption = {
		
		// 饼图
		pieOption:function(conf){
			return {
				title : {
					text : conf.text || '未定义',
					subtext : conf.subText || ''
				},
				tooltip : {
					trigger : 'item',
					formatter : conf.formatter || "{b} {c} ({d}%)"
				},
				legend : {
					x : 'center',
					y : 'bottom',
					data : conf.data
				},

				calculable : true,
				series : [{
					type : 'pie',
					radius : '40%',
					center : [ '50%', '52%' ],
					data : conf.data,
					itemStyle : {
						normal : {
							label : {
								show : true,
								formatter : function(p) {
									return p.name + "\n" +helper.format.formatNum3(p.value||0);
								}
							}
						}
					}
				}]
			};
		},
		
		// 柱状图
		barOption:function(conf){
			return {
				title : {
					text : conf.text || '未定义',
					subtext : conf.subText || ''
				},
				tooltip : {
					trigger: 'item',
					formatter : conf.formatter || "{b}({c})"
				},
				dataZoom : {
					show : true, start : 30, end : 70
				},
				xAxis : [{
					type : 'category',
					axisLabel : {
						formatter : function(v) {
							if (v > 0 && v <= conf.data.length) {
								return conf.data[v - 1].name;
							} else {
								return v;
							}
						}
					},
					data : function() {
						var list = [];
						for (var i = 0; i < conf.data.length; i++) {
							list.push(i + 1);
						}
						return list;
					}()
				}],
				yAxis : [{
					type : 'value'
				}],
				animation : false,
				series : [{
					type : 'bar',
					 itemStyle: {
			                normal: {
			                    color: function(params) {
			                        var colorList = [
			                          '#C1232B','#B5C334','#FCCE10','#E87C25','#27727B',
			                           '#FE8463','#9BCA63','#FAD860','#F3A43B','#60C0DD',
			                           '#D7504B','#C6E579','#F4E001','#F0805A','#26C0C0'
			                        ];
			                        return colorList[params.dataIndex%colorList.length]
			                    }
			                }
			            },
					data : conf.data
				}]
			};
		},
		
		// 散点图
		scatterOption:function(conf){
			
			var maxValue = 0;
			for(var i=0;i<conf.data.length;i++){
				maxValue = maxValue>conf.data[i].value?maxValue:conf.data[i].value;
			}
			return {
				title : {
					text : conf.text || '未定义',
					subtext : conf.subText || ''
				},
				tooltip : {
					trigger : 'axis',
					axisPointer : {
						show : true,
						type : 'cross',
						lineStyle : {
							type : 'dashed',
							width : 1
						}
					}
				},
				dataZoom : {
					show : true,
					start : 30,
					end : 70
				},
				dataRange : {
					min : 0,
					max : maxValue,
					orient : 'horizontal',
					y : 'top',
					x : 'right',
					text : [ '高', '低' ], // 文本，默认为数值文本
					color : [ 'rgba(217, 78, 93, 1)','rgba(234, 199, 54, 1)','rgba(80, 163, 186, 1)' ],
					calculable : true
				},
				xAxis : [
					{
						type : 'category',
						axisLabel : {
							formatter : function(v) {
								if (v > 0 && v <= conf.data.length) {
									return conf.data[v - 1].name;
								} else {
									return v;
								}
							}
						},
						data : function() {
							var list = [];
							for (var i = 0; i < conf.data.length; i++) {
								list.push(i + 1);
							}
							return list;
						}()
					}
				],
				yAxis : [
					{
						type : 'value'
					}
				],
				animation : false,
				series : [
					{
						type : 'scatter',
						tooltip : {
							trigger : 'item',
							formatter : conf.formatter || function(params) {
								return conf.data[params.value[0] - 1].name + ' （' + params.value[2] + '）'
							},
							axisPointer : {
								show : true
							}
						},
						symbolSize : function(value) {
							var size = ((value[2] / maxValue).toFixed(2)-0) * 20;
							if(size<5){
								return 5;
							}else if(size>20){
								return 20;
							}
							return size;
						},
						data : function() {
							var list = [];
							for (var i = 0; i < conf.data.length; i++) {
								list.push([ i + 1,(conf.data[i].value - 0),(conf.data[i].value - 0) ])
							}
							return list;
						}()
					}
				]
			};
		},
		
		lineOption:function(conf){
			var max = 0;
			var dw = '';
			for(var i=0;i<conf.data.length;i++){
				if(conf.data[i].value>max){
					max=conf.data[i].value;
				}
        	}
			if(max>=100000000){
				dw='亿';
				for(var i=0;i<conf.data.length;i++){
					conf.data[i].value=(conf.data[i].value/100000000).toFixed(2);
				}
			}else if(max>=10000){
				dw='万';
				for(var i=0;i<conf.data.length;i++){
					conf.data[i].value=(conf.data[i].value/10000).toFixed(2);
				}
			}
			return  {
				title : {
					text : conf.text || '未定义',
					subtext : conf.subText || ''
				},
			    tooltip : {
			        trigger: 'axis'
			    },
			    calculable : true,
			    xAxis : [
			        {
			            type : 'category',
			            data : function(){
			            	var d = [];
			            	for(var i=0;i<conf.data.length;i++){
			            		d.push(conf.data[i].name);
			            	}
			            	return d;
			            }()
			        }
			    ],
			    yAxis : [
			        {
			            type : 'value',
			            // axisLabel: {
			            //     formatter: '{value}'+dw
			            // }
			        }
			    ],
			    series : [
			        {
			            type:'line',
			            data:function(){
			            	var d = [];
			            	for(var i=0;i<conf.data.length;i++){
			            		d.push(conf.data[i].value);
			            	}
			            	return d;
			            }()
			        }
			    ]
			};
		}
		
	};

}); 